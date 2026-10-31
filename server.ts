import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import { Resend } from "resend";

async function startServer() {
  const app = express();
  const PORT = 3000;

  // Middleware to parse JSON
  app.use(express.json());

  // API Route for sending contact email
  app.post("/api/contact", async (req, res) => {
    try {
      const { name, email, message, attachment } = req.body;

      if (!name || !email || !message) {
        return res.status(400).json({ error: "Missing required fields" });
      }

      const apiKey = process.env.RESEND_API_KEY;
      const web3formsKey = process.env.WEB3FORMS_ACCESS_KEY;

      if (!apiKey && !web3formsKey) {
        console.error("Neither RESEND_API_KEY nor WEB3FORMS_ACCESS_KEY is set in environment.");
        return res.status(500).json({ 
          error: "Email API key (RESEND_API_KEY or WEB3FORMS_ACCESS_KEY) is not set in environment. Please add it to your environment secrets or Vercel settings." 
        });
      }

      if (!apiKey && web3formsKey) {
        const formPayload = new FormData();
        formPayload.append("access_key", web3formsKey);
        formPayload.append("name", name);
        formPayload.append("email", email);
        formPayload.append("subject", `New Portfolio Message from ${name}`);
        formPayload.append("message", message);

        const wfRes = await fetch("https://api.web3forms.com/submit", {
          method: "POST",
          body: formPayload,
        });
        const wfData = await wfRes.json();

        if (!wfData.success) {
          throw new Error(wfData.message || "Failed to deliver email via Web3Forms");
        }

        return res.status(200).json({ success: true, message: "Thank you! Your message has been sent." });
      }

      const resend = new Resend(process.env.RESEND_API_KEY);

      // Setup email payload
      const emailPayload: any = {
        from: 'Contact Form <onboarding@resend.dev>',
        to: ['dharmitpatel8960@gmail.com'],
        subject: `New Portfolio Message from ${name}`,
        html: `<p><strong>Name:</strong> ${name}</p>
               <p><strong>Email:</strong> ${email}</p>
               <p><strong>Message:</strong></p>
               <p>${message.replace(/\n/g, '<br/>')}</p>
               ${attachment ? `<p><strong>Attachment Included:</strong> ${attachment.name} (${attachment.type})</p>` : ''}`,
        replyTo: email,
      };

      if (attachment && attachment.base64) {
        emailPayload.attachments = [
          {
            content: Buffer.from(attachment.base64, 'base64'),
            filename: attachment.name,
          }
        ];
      }

      const data = await resend.emails.send(emailPayload);

      if (data.error) {
        throw new Error(data.error.message);
      }

      res.status(200).json({ success: true, message: "Thank you! Your message has been sent." });
    } catch (error: any) {
      console.error("Error sending email:", error);
      res.status(500).json({ error: error.message || "Failed to send email" });
    }
  });

  // API Route for weather proxy (protects OpenWeather API key from the browser)
  app.get("/api/weather", async (req, res) => {
    try {
      const { q } = req.query;
      if (!q) {
        return res.status(400).json({ error: "Missing city query parameter 'q'" });
      }

      const apiKey = process.env.OPENWEATHER_API_KEY;
      if (!apiKey) {
        return res.status(500).json({ error: "OpenWeather API key is not configured in environment secrets." });
      }
      const BASE = 'https://api.openweathermap.org/data/2.5';
      const params = `q=${encodeURIComponent(q as string)},IN&appid=${apiKey}&units=metric`;

      const [weatherRes, forecastRes] = await Promise.all([
        fetch(`${BASE}/weather?${params}`),
        fetch(`${BASE}/forecast?${params}`),
      ]);

      if (!weatherRes.ok) {
        const err = await weatherRes.json().catch(() => ({}));
        return res.status(weatherRes.status).json({ error: err.message || `City "${q}" not found.` });
      }

      const weather = await weatherRes.json();
      const forecast = forecastRes.ok ? await forecastRes.json() : null;

      res.status(200).json({ weather, forecast });
    } catch (error: any) {
      console.error("Error fetching weather from proxy:", error);
      res.status(500).json({ error: error.message || "Failed to fetch weather" });
    }
  });

  // Vite middleware for development
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
