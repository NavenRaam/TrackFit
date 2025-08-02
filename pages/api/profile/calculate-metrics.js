// pages/api/profile/calculate-metrics.js (Conceptual structure)
import dbConnect from '@/lib/mongodb';
import UserProfile from '@/models/UserProfile';

export default async function handler(req, res) {
    await dbConnect();

    if (req.method !== 'POST') {
        return res.status(405).json({ message: 'Method Not Allowed' });
    }

    const { email } = req.body;
    if (!email) {
        return res.status(400).json({ message: 'Email required' });
    }

    try {
        // Find the user profile
        const profile = await UserProfile.findOne({ email });
        if (!profile) {
            return res.status(404).json({ message: 'User profile not found.' });
        }

        // --- PERFORM CALCULATIONS HERE ---
        // Use profile.age, profile.gender, profile.weight, profile.height, profile.activityLevel, profile.fitnessGoal
        // Example (simplified - replace with your actual formulas):
        let bmr;
        if (profile.gender === 'Male') {
            bmr = (10 * profile.weight) + (6.25 * profile.height) - (5 * profile.age) + 5;
        } else { // Female
            bmr = (10 * profile.weight) + (6.25 * profile.height) - (5 * profile.age) - 161;
        }

        let tdee;
        // Map activityLevel to a multiplier. Ensure these strings match your *schema* enums.
        const activityMultipliers = {
            "Sedentary": 1.2,
            "Lightly Active": 1.375,
            "Moderately Active": 1.55,
            "Very Active": 1.725,
            "Extra Active": 1.9
        };
        const multiplier = activityMultipliers[profile.activityLevel];
        if (!multiplier) {
            // This is a critical error if activityLevel is not valid
            console.error(`Invalid activityLevel: ${profile.activityLevel} for email: ${email}`);
            return res.status(400).json({ message: 'Invalid activity level in profile for calculation.' });
        }
        tdee = bmr * multiplier;

        let targetCalories = tdee;
        let proteinGrams = 0, carbsGrams = 0, fatsGrams = 0;

        if (profile.fitnessGoal === "Weight Loss") {
            targetCalories -= 500; // Example deficit
            proteinGrams = (targetCalories * 0.3) / 4; // 30% protein
            carbsGrams = (targetCalories * 0.4) / 4;  // 40% carbs
            fatsGrams = (targetCalories * 0.3) / 9;    // 30% fats
        } else if (profile.fitnessGoal === "Muscle Gain") {
            targetCalories += 300; // Example surplus
            proteinGrams = (targetCalories * 0.4) / 4;
            carbsGrams = (targetCalories * 0.4) / 4;
            fatsGrams = (targetCalories * 0.2) / 9;
        } else if (profile.fitnessGoal === "Maintenance") {
            targetCalories = profile.maintenanceCalories || tdee; // Use user-provided if exists, else calculated
            proteinGrams = (targetCalories * 0.3) / 4;
            carbsGrams = (targetCalories * 0.5) / 4;
            fatsGrams = (targetCalories * 0.2) / 9;
        } else { // Improve Endurance or other
            proteinGrams = (targetCalories * 0.25) / 4;
            carbsGrams = (targetCalories * 0.55) / 4;
            fatsGrams = (targetCalories * 0.2) / 9;
        }
        // --- END CALCULATIONS ---

        // **D1: SAVE CALCULATED VALUES BACK TO THE PROFILE**
        profile.targetCalories = Math.round(targetCalories);
        profile.targetMacros = {
            protein: Math.round(proteinGrams),
            carbs: Math.round(carbsGrams),
            fats: Math.round(fatsGrams),
        };
        // Also ensure maintenanceCalories is correctly set based on goal
        if (profile.fitnessGoal !== 'Maintenance') {
            profile.maintenanceCalories = undefined; // Clear if not maintenance goal
        } else if (profile.maintenanceCalories === undefined || profile.maintenanceCalories === null) {
            profile.maintenanceCalories = Math.round(tdee); // If maintenance, but not set, set to TDEE
        }

        await profile.save(); // Save the updated profile document

        return res.status(200).json({ message: 'Metrics calculated and profile updated successfully.', profile: profile.toObject() });

    } catch (error) {
        console.error("Error in calculate-metrics API:", error);
        // Provide more specific error if needed
        return res.status(500).json({ message: 'Failed to calculate metrics.', error: error.message });
    }
}
