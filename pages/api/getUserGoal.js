// This would fetch the basic profile info already stored
export default async function handler(req, res) {
  const { email } = req.body;
  const user = await db.collection("users").findOne({ email });
  if (!user) return res.status(404).json({ error: "User not found" });
  res.json({ fitnessGoal: user.fitnessGoal });
}
