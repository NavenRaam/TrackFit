import dbConnect from "@/lib/mongodb";
import Plan from "@/models/Plan";

export default async function handler(req, res) {
  if (req.method !== "GET") return res.status(405).end();

  const { email } = req.query;
  if (!email) return res.status(400).json({ error: "Email required" });

  try {
    await dbConnect();
    const plan = await Plan.findOne({ email, type: "workout" });

    if (!plan) return res.status(404).json({ error: "Plan not found" });

    res.status(200).json({
      startDate: plan.startDate || plan.createdAt?.toISOString().split("T")[0],
      durationWeeks: plan.durationWeeks || 8,
    });
  } catch (err) {
    console.error("Plan-meta error:", err);
    res.status(500).json({ error: "Server error" });
  }
}
