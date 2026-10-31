import { Resend } from "resend";

export default async function handler(req: any, res: any) {
  // Set CORS headers
  res.setHeader('Access-Control-Allow-Credentials', 'true');
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,PATCH,DELETE,POST,PUT');
  res.setHeader(
    'Access-Control-Allow-Headers',
    'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version'
  );

  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { name, email, message, attachment } = req.body || {};

    if (!name || !email || !message) {
      return res.status(400).json({ error: "Missing required fields (name, email, or message)" });
    }

    const apiKey = process.env.RESEND_API_KEY;

    if (!apiKey) {
      // In development or when RESEND_API_KEY is not configured yet in Vercel environment variables,
      // simulate success so the form does not fail for the user.
      console.warn("RESEND_API_KEY is not configured in Vercel environment. Simulating email receipt.");
      return res.status(200).json({
        success: true,
        simulated: true,
        message: "Message received! (Add RESEND_API_KEY in Vercel settings to receive live emails)",
      });
    }

    const resend = new Resend(apiKey);

    const emailPayload: any = {
      from: 'Contact Form <onboarding@resend.dev>',
      to: ['dharmitpatel8960@gmail.com'],
      subject: `New Portfolio Message from ${name}`,
      html: `
        <div style="font-family: sans-serif; line-height: 1.6; color: #111;">
          <h2>New Message from Portfolio Contact Form</h2>
          <p><strong>Name:</strong> ${name}</p>
          <p><strong>Email:</strong> <a href="mailto:${email}">${email}</a></p>
          <p><strong>Message:</strong></p>
          <div style="background: #f4f4f4; padding: 12px; border-radius: 6px; white-space: pre-wrap;">${message}</div>
          ${attachment ? `<p style="margin-top: 15px;"><strong>Attachment:</strong> ${attachment.name} (${attachment.type})</p>` : ''}
        </div>
      `,
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

    return res.status(200).json({ success: true, message: "Thank you! Your message has been sent." });
  } catch (error: any) {
    console.error("Error in /api/contact serverless function:", error);
    return res.status(500).json({ error: error.message || "Failed to send email" });
  }
}
