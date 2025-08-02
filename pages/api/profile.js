import dbConnect from "@/lib/mongodb";
import UserProfile from "@/models/UserProfile";
import Plan from "@/models/Plan"; // for cache-invalidating

export default async function handler(req, res) {
    await dbConnect();
    const { method } = req;

    /* ─────────────── GET: return profile by e-mail ─────────────── */
    if (method === "GET") {
        const { email } = req.query;
        if (!email) {
            return res.status(400).json({ error: "Email required" });
        }

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
        if (!data.email) {
            return res.status(400).json({ error: "Email required" });
        }

        /* make sure numeric strings → numbers, empty strings → undefined */
        const num = (v) => (v === "" || v === undefined ? undefined : Number(v));

        try {
            // Process comma-separated strings into arrays
            const processedPreferredWorkouts = typeof data.preferredWorkouts === 'string'
                ? data.preferredWorkouts.split(",").map((w) => w.trim()).filter(Boolean)
                : (Array.isArray(data.preferredWorkouts) ? data.preferredWorkouts : []);

            // Process nested dietary fields
            const processedAllergies = typeof data.dietaryPreferences?.allergies === 'string'
                ? data.dietaryPreferences.allergies.split(",").map((a) => a.trim()).filter(Boolean)
                : (Array.isArray(data.dietaryPreferences?.allergies) ? data.dietaryPreferences.allergies : []);

            const processedDislikes = typeof data.dietaryPreferences?.dislikes === 'string'
                ? data.dietaryPreferences.dislikes.split(",").map((d) => d.trim()).filter(Boolean)
                : (Array.isArray(data.dietaryPreferences?.dislikes) ? data.dietaryPreferences.dislikes : []);

            // === FIX: Map frontend values to schema enum values to prevent validation errors ===
            const fitnessGoalMapping = {
                "Weight Loss": "Weight Loss",
                "Gain Muscle": "Muscle Gain", // Correcting "Gain Muscle" to "Muscle Gain"
                "Maintenance": "Maintenance",
                "Improve Endurance": "Improve Endurance",
            };

            const activityLevelMapping = {
                "Sedentary": "Sedentary",
                "Lightly Active (light exercise/sports 1-3 days/week)": "Lightly Active", // Correcting the long string
                "Moderately Active (moderate exercise/sports 3-5 days/week)": "Moderately Active",
                "Very Active (heavy exercise/sports 6-7 days/week)": "Very Active",
                "Extra Active (very heavy exercise/sports & physical job)": "Extra Active",
            };

            const mappedFitnessGoal = fitnessGoalMapping[data.fitnessGoal] || data.fitnessGoal;
            const mappedActivityLevel = activityLevelMapping[data.activityLevel] || data.activityLevel;
            // === END FIX ===

            const updated = await UserProfile.findOneAndUpdate(
                { email: data.email },
                {
                    // Top-level fields
                    age: num(data.age),
                    gender: data.gender,
                    height: num(data.height),
                    weight: num(data.weight),
                    fitnessGoal: mappedFitnessGoal, // Use the mapped value
                    activityLevel: mappedActivityLevel, // Use the mapped value
                    targetWeight: num(data.targetWeight),
                    durationWeeks: num(data.durationWeeks),
                    workoutDaysPerWeek: num(data.workoutDaysPerWeek),
                    preferredWorkoutDurationMinutes: num(data.preferredWorkoutDurationMinutes),
                    experienceLevel: data.experienceLevel,
                    preferredWorkouts: processedPreferredWorkouts,
                    workoutLocation: data.workoutLocation,
                    maintenanceCalories: num(data.maintenanceCalories),

                    // Correctly nest dietaryPreferences
                    dietaryPreferences: {
                        dietType: data.dietaryPreferences?.dietType,
                        allergies: processedAllergies,
                        dislikes: processedDislikes,
                        mealsPerDay: num(data.dietaryPreferences?.mealsPerDay),
                        otherNotes: data.dietaryPreferences?.otherNotes,
                    }
                },
                { new: true, upsert: true, runValidators: true, setDefaultsOnInsert: true }
            ).lean();

            // Invalidate existing cached plans for this user so a new one is generated
            // based on the updated profile.
            await Plan.deleteMany({ email: data.email });

            return res.status(200).json(updated);
        } catch (err) {
            console.error("POST /api/profile error", err);
            // Return a more descriptive error message in the response
            return res.status(500).json({ error: "Failed to save profile due to validation errors. Check your input values.", details: err.message });
        }
    }

    res.setHeader("Allow", ["GET", "POST"]);
    return res.status(405).end(`Method ${method} Not Allowed`);
}
