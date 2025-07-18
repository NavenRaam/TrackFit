// pages/api/progress/days.js
import dbConnect from "@/lib/mongodb";
import Progress from "@/models/Progress";

export default async function handler(req, res) {
  if (req.method !== "GET") return res.status(405).end();

  const { email } = req.query;
  if (!email) return res.status(400).json({ error: "email required" });

  try {
    await dbConnect();
    const logs = await Progress.find({ email });

    // send array → front‑end expects logs.map(...)
    const result = logs.map((log) => ({
      date: log.date,
      completed: log.completed || false,
      weight: log.weight ?? null,
      calories: log.calories ?? null,
      metric1: log.metric1 ?? null,
      metric2: log.metric2 ?? null
    }));

    res.status(200).json(result);
  } catch (err) {
    console.error("GET /progress/days error:", err);
    res.status(500).json({ error: "Internal error" });
  }
}
