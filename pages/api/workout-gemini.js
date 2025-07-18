import dbConnect from "@/lib/mongodb";
import UserProfile from "@/models/UserProfile";
import Plan from "@/models/Plan";
import { GoogleGenerativeAI } from "@google/generative-ai";
import dayjs from "dayjs"; // Make sure dayjs is installed: npm install dayjs

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

// Helper function to escape characters that could break template literals or JSON
const escapeForPrompt = (str) => {
    if (typeof str !== 'string') return str;
    // Escape backticks, double quotes, and newlines for safety within the prompt string itself
    return str
        .replace(/`/g, '\\`')    // Escape backticks (`)
        .replace(/"/g, '\\"')    // Escape double quotes (")
        .replace(/\n/g, '\\n');  // Escape newlines (\n)
};

export default async function handler(req, res) {
    if (req.method !== "GET") {
        return res.status(405).end(); // Method Not Allowed
    }

    const { email, refresh } = req.query;
    if (!email) {
        return res.status(400).json({ error: "Email is required." });
    }

    try {
        await dbConnect();

        /* ---------- 1. Serve cached plan unless ?refresh=1 ---------- */
        if (!refresh) {
            const cached = await Plan.findOne({ email, type: "workout" });
            if (cached) {
                const cachedPlanEndDate = dayjs(cached.startDate).add(cached.durationWeeks, "week");
                // If current date is before the plan's end date, serve cached
                if (dayjs().isBefore(cachedPlanEndDate)) {
                    console.log(`Serving cached plan for ${email}.`);
                    return res.status(200).json({
                        plan: JSON.parse(cached.content),
                        meta: {
                            startDate: cached.startDate,
                            durationWeeks: cached.durationWeeks,
                        },
                    });
                }
                console.log(`Cached plan for ${email} has expired (${dayjs().format('YYYY-MM-DD')} > ${cachedPlanEndDate.format('YYYY-MM-DD')}). Generating new plan.`);
            }
        }

        /* ---------- 2. Fetch user profile ---------- */
        const profile = await UserProfile.findOne({ email });
        if (!profile) {
            return res.status(404).json({ error: "Profile not found. Please complete your profile first." });
        }

        /* ---------- Extract detailed profile preferences and escape them for the prompt ---------- */
        const durationWeeks = profile.durationWeeks || 8; // Default to 8 weeks if not set
        const workoutDaysPerWeek = profile.workoutDaysPerWeek || 3; // Default to 3 days/week
        const preferredWorkoutDurationMinutes = profile.preferredWorkoutDurationMinutes || 60; // Default to 60 mins
        
        // Apply escapeForPrompt to all string fields coming from user input
        const experienceLevel = escapeForPrompt(profile.experienceLevel || "Beginner");
        const preferredWorkouts = escapeForPrompt(profile.preferredWorkouts?.length ? profile.preferredWorkouts.join(", ") : "any");
        const workoutLocation = escapeForPrompt(profile.workoutLocation || "any");
        const fitnessGoal = escapeForPrompt(profile.fitnessGoal || "overall fitness");

        // Profile fields that are numbers and don't need escaping for prompt injection
        const age = profile.age;
        const gender = profile.gender;
        const height = profile.height;
        const weight = profile.weight;
        const activityLevel = profile.activityLevel;


        // --- Dynamically generate the 'days' array example for the schema ---
        // This will generate a full 7-day example, marking workout days vs. rest days,
        // to strongly guide Gemini on the output structure.
        const exampleDays = [];
        const daysOfWeek = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"];
        for (let i = 0; i < 7; i++) { // Always generate 7 days for the example
            const dayName = daysOfWeek[i];
            if (i < workoutDaysPerWeek) {
                // This is a workout day example
                exampleDays.push(`{ "day": "${dayName}", "title": "Example Workout Focus (e.g., Chest & Triceps)", "exercises": [ { "name": "Exercise A", "sets": 3, "reps": "8-12", "notes": "Focus on form and controlled movement." } ] }`);
            } else {
                // This is a rest or active recovery day example
                exampleDays.push(`{ "day": "${dayName}", "title": "Rest Day / Active Recovery", "exercises": [ { "name": "Light Stretching or Walk", "sets": 1, "reps": "30 minutes", "notes": "Focus on recovery and mobility. Avoid strenuous activity." } ] }`);
            }
        }
        const exampleDaysString = exampleDays.join(',\n');

        /* ---------- 3. Build JSON-schema prompt ---------- */
        const prompt = `
You are a highly experienced and certified strength and fitness coach, specializing in creating personalized workout plans. Your goal is to generate an effective, safe, and highly optimized workout program tailored to the user's detailed profile and preferences.

Return valid JSON only (no markdown, no explanations, no conversational text) matching this schema exactly:

{
  "info": [
    "General warm-up guidelines (e.g., 5-10 min light cardio & dynamic stretching before each workout)",
    "General cool-down guidelines (e.g., 5-10 min static stretching after each workout)",
    "Prioritize proper form over heavy weight to prevent injury.",
    "Stay hydrated throughout the day, especially during workouts.",
    "Ensure adequate sleep for muscle recovery and overall well-being.",
    "Listen to your body; take extra rest days if needed, and don't push through sharp pain."
  ],
  "days": [
    ${exampleDaysString} // Dynamically generated example days for the full 7-day week
  ],
  "progression": [
    "Progression Strategy: When you can comfortably complete all prescribed sets and reps for an exercise, aim to increase the weight slightly (e.g., 2.5-5 kg) or add 1-2 more reps next session.",
    "Overload Principle: To continue making progress, you must consistently challenge your muscles beyond their current capacity.",
    "Exercise Variation: If an exercise becomes stale or causes discomfort, research and substitute it with a similar movement pattern.",
    "Deload Week: Consider a deload week every 4-8 weeks where you reduce volume (sets/reps) and/or intensity (weight) by 40-50% to aid recovery and prevent burnout. This is especially important for multi-week plans."
  ]
}

Generate a detailed and optimized **Week 1** workout plan based on the following comprehensive user profile, strictly adhering to all specified constraints:

**User Profile:**
• Goal: "${fitnessGoal}"
• Age: ${age} years old
• Gender: ${gender}
• Height: ${height} cm
• Weight: ${weight} kg
• Activity Level: ${activityLevel}
• Experience Level: ${experienceLevel}
• Preferred Workout Location: ${workoutLocation}
• Preferred Workouts: ${preferredWorkouts}
• **Desired Workout Frequency:** ${workoutDaysPerWeek} structured workout days per week.
• **Desired Session Duration:** Approximately ${preferredWorkoutDurationMinutes} minutes per workout session.
• Total Plan Duration Context: This plan is part of a ${durationWeeks}-week program. (Keep initial intensity appropriate for Week 1).

**Important Generation Rules for Optimization:**
1.  **ALWAYS Generate a Complete 7-Day Schedule:** The 'days' array MUST contain exactly 7 entries, one for each day of the week (Monday through Sunday).
2.  **CRITICAL: Workout vs. Rest Days Balance:**
    * **STRICTLY ${workoutDaysPerWeek} days** MUST be full, structured workout days with detailed exercises and sets/reps. These days are for hitting the gym/performing substantial exercise.
    * The remaining ${7 - workoutDaysPerWeek} days MUST be explicitly marked as "Rest Day" or "Active Recovery". For these days, suggest only light activities like stretching, walking, or foam rolling, and ensure there are NO strenuous or heavy resistance exercises. Prioritize active engagement only on the specified workout days.
3.  **Session Duration Adherence:** For workout days, the number of exercises, sets, and reps must be chosen so that the entire session reasonably fits within **approximately ${preferredWorkoutDurationMinutes} minutes**. Be mindful of warm-up/cool-down time.
4.  **Experience Level Tailoring:**
    * For "${experienceLevel}" individuals, select appropriate exercises, set/rep ranges, and intensity.
    * **Beginner:** Focus on compound movements, proper form, fewer complex exercises, and moderate volume. Include clear form notes.
    * **Intermediate:** Introduce more advanced variations, slightly higher volume/intensity, and perhaps some isolation work.
    * **Advanced:** Incorporate advanced techniques (e.g., supersets, dropsets, periodization principles), higher volume/intensity, and challenging exercises.
5.  **Location/Preference Integration:** Prioritize exercises that can be performed at a "${workoutLocation}" and align with "${preferredWorkouts}". If "any", provide a balanced mix.
6.  **Exercise Details:** For every exercise, include the "name", "sets", "reps", and a concise, actionable "notes" field (e.g., "Keep core tight", "Squeeze glutes at top", "Slow eccentric").
7.  **Progression/Info Detail:** Provide specific and actionable tips in both the "info" and "progression" arrays. Make them detailed and genuinely helpful, reflecting a coach's advice.
8.  **Strict JSON Format:** Do not include any markdown fences (\`\`\`json), explanations, comments, or conversational text outside the JSON object. The response must be a pure JSON string.
`.trim();

        /* ---------- 4. Call Gemini in JSON mode ---------- */
        const model = genAI.getGenerativeModel({
            model: "gemini-1.5-flash",
            generationConfig: { response_mime_type: "application/json" },
        });

        const { response } = await model.generateContent(prompt);
        let planJson;
        try {
            planJson = JSON.parse(response.text());
        } catch (parseError) {
            console.error("Failed to parse Gemini response:", response.text(), parseError);
            return res.status(500).json({ error: "Failed to parse workout plan from AI. Please try again." });
        }

        // --- Post-generation validation and correction (ensure 7 days, even if AI deviates) ---
        if (!planJson || !Array.isArray(planJson.days) || !Array.isArray(planJson.info) || !Array.isArray(planJson.progression)) {
            console.error("Gemini returned unexpected structure:", JSON.stringify(planJson, null, 2));
            return res.status(500).json({ error: "AI returned an invalid plan structure. Please try again." });
        }

        // Ensure the generated plan has exactly 7 days
        if (planJson.days.length !== 7) {
            console.warn(`Gemini generated ${planJson.days.length} days, but 7 were expected for a full week. Attempting to correct by padding/truncating.`);
            const daysOfWeek = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"];
            
            // If too many days, truncate
            if (planJson.days.length > 7) {
                planJson.days = planJson.days.slice(0, 7);
            } else {
                // If too few, pad with generic rest days to ensure 7 days are always returned
                while (planJson.days.length < 7) {
                    const dayIndex = planJson.days.length;
                    planJson.days.push({
                        "day": daysOfWeek[dayIndex],
                        "title": "Rest Day (Auto-Generated)", // Clearly mark these as auto-generated
                        "exercises": [{ "name": "Light Stretching or Walk", "sets": 1, "reps": "30 mins", "notes": "Focus on recovery and mobility." }]
                    });
                }
            }
        }
        
        /* ---------- 5. Cache with metadata ---------- */
        const startDate = new Date().toISOString().split("T")[0]; // Current date as YYYY-MM-DD string

        const updated = await Plan.findOneAndUpdate(
            { email, type: "workout" },
            {
                email,
                goal: fitnessGoal, // Use the extracted and escaped fitnessGoal
                type: "workout",
                content: JSON.stringify(planJson),
                startDate,
                durationWeeks, // Store the determined durationWeeks
            },
            { upsert: true, new: true, setDefaultsOnInsert: true } // Upsert: create if not exists, return new document
        );

        return res.status(200).json({
            plan: planJson,
            meta: {
                startDate: updated.startDate,
                durationWeeks: updated.durationWeeks,
            },
        });
    } catch (err) {
        console.error("Gemini workout API error:", err);
        if (err.message.includes("API key not valid")) {
            return res.status(500).json({ error: "Server configuration error: Gemini API key is invalid." });
        }
        return res.status(500).json({ error: "Failed to generate workout plan due to a server error. Please try again." });
    }
}