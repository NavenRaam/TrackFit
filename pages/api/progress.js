// pages/api/progress.js
import dbConnect from "@/lib/mongodb";
import Progress from "@/models/Progress";

export default async function handler(req, res) {
  const { email, date } = req.query;
  if (!email) return res.status(400).json({ error: "email required" });

  await dbConnect();

  if (req.method === "GET") {
    // return a single‑day log (today by default)
    const day = date || new Date().toISOString().split("T")[0];
    const doc = await Progress.findOne({ email, date: day });
    return res.status(200).json(doc || {});
  }

  if (req.method === "POST") {
    const {
      date: bodyDate,
      completed,
      weight,
      calories,
      metric1,
      metric2
    } = req.body;

    const day = bodyDate || new Date().toISOString().split("T")[0];

    const saved = await Progress.findOneAndUpdate(
      { email, date: day },
      { email, date: day, completed, weight, calories, metric1, metric2 },
      { upsert: true, new: true }
    );
    return res.status(200).json(saved);
  }

  res.status(405).end(); // Method Not Allowed
}
