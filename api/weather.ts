export default async function handler(req: any, res: any) {
  res.setHeader('Access-Control-Allow-Credentials', 'true');
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS');
  res.setHeader(
    'Access-Control-Allow-Headers',
    'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version'
  );

  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  try {
    const { q } = req.query || {};
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

    return res.status(200).json({ weather, forecast });
  } catch (error: any) {
    console.error("Error in /api/weather serverless function:", error);
    return res.status(500).json({ error: error.message || "Failed to fetch weather" });
  }
}
