import dbConnect from '@/lib/mongodb';
import UserProfile from "../../models/UserProfile";

export default async function handler(req, res) {
  await dbConnect();

  const { method } = req;

  if (method === "GET") {
    // GET /api/profile?email=...
    const { email } = req.query;
    if (!email) return res.status(400).json({ error: "Email required" });

    try {
      const profile = await UserProfile.findOne({ email }).lean();
      if (!profile) return res.status(404).json(null);
      return res.status(200).json(profile);
    } catch (error) {
      return res.status(500).json({ error: "Database error" });
    }
  } 
  else if (method === "POST") {
    // Save or update profile
    const data = req.body;

    if (!data.email) return res.status(400).json({ error: "Email required" });

    try {
      const updatedProfile = await UserProfile.findOneAndUpdate(
        { email: data.email },
        {
          age: data.age,
          gender: data.gender,
          height: data.height,
          weight: data.weight,
          fitnessGoal: data.fitnessGoal,
          activityLevel: data.activityLevel,
          targetWeight: Number(data.targetWeight),
          durationWeeks: data.durationWeeks,
          workoutDays: data.workoutDays,
          dietType: data.dietType,
          allergies: data.allergies || [],
          preferredWorkouts: data.preferredWorkouts || [],
          workoutLocation: data.workoutLocation,
          maintenanceCalories: Number(data.maintenanceCalories),
          mealsPerDay: Number(data.mealsPerDay)
        },
        { new: true, upsert: true, setDefaultsOnInsert: true }
      );

      return res.status(200).json(updatedProfile);
    } catch (error) {
      return res.status(500).json({ error: "Failed to save profile" });
    }
  } 
  else {
    res.setHeader("Allow", ["GET", "POST"]);
    res.status(405).end(`Method ${method} Not Allowed`);
  }
}
