import dbConnect from "@/lib/mongodb";
import UserProfile from "@/models/UserProfile";
import Plan from "@/models/Plan"; // for cache-invalidating

export default async function handler(req, res) {
  await dbConnect();
  const { method } = req;

  /* ─────────────── GET: return profile by e-mail ─────────────── */
  if (method === "GET") {
    const { email } = req.query;
    if (!email) return res.status(400).json({ error: "Email required" });

    try {
      const profile = await UserProfile.findOne({ email }).lean();
      return res.status(profile ? 200 : 404).json(profile || null);
    } catch (err) {
      console.error("GET /api/profile error", err);
      return res.status(500).json({ error: "Database error" });
    }
  }

  /* ─────────────── POST: create / update profile ─────────────── */
  if (method === "POST") {
    const data = req.body;
    if (!data.email) return res.status(400).json({ error: "Email required" });

    /* make sure numeric strings → numbers, empty strings → undefined */
    const num = (v) => (v === "" || v === undefined ? undefined : Number(v));

    try {
      const updated = await UserProfile.findOneAndUpdate(
        { email: data.email },
        {
          age: num(data.age),
          gender: data.gender,
          height: num(data.height),
          weight: num(data.weight),
          fitnessGoal: data.fitnessGoal,
          activityLevel: data.activityLevel,
          targetWeight: num(data.targetWeight),
          durationWeeks: num(data.durationWeeks),
          // --- IMPORTANT: Corrected and Added New Fields Here ---
          workoutDaysPerWeek: num(data.workoutDaysPerWeek), // Corrected name to match frontend/Gemini API
          preferredWorkoutDurationMinutes: num(data.preferredWorkoutDurationMinutes), // New field
          experienceLevel: data.experienceLevel, // New field
          // --- End New Fields ---
          dietType: data.dietType,
          allergies: data.allergies || [],
          preferredWorkouts: data.preferredWorkouts || [],
          workoutLocation: data.workoutLocation,
          maintenanceCalories: num(data.maintenanceCalories),
          mealsPerDay: num(data.mealsPerDay),
        },
        { new: true, upsert: true, setDefaultsOnInsert: true }
      ).lean();

      // Invalidate existing cached plans for this user so a new one is generated
      // based on the updated profile.
      await Plan.deleteMany({ email: data.email });

      return res.status(200).json(updated);
    } catch (err) {
      console.error("POST /api/profile error", err);
      return res.status(500).json({ error: "Failed to save profile" });
    }
  }

  res.setHeader("Allow", ["GET", "POST"]);
  return res.status(405).end(`Method ${method} Not Allowed`);
}