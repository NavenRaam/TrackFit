// pages/api/diet-gemini.js
import { GoogleGenerativeAI } from '@google/generative-ai';
import dbConnect from '@/lib/mongodb';
import UserProfile from '@/models/UserProfile';
import DietPlan from '@/models/DietPlan';
import dayjs from 'dayjs';
import isSameOrBefore from 'dayjs/plugin/isSameOrBefore'; // Import plugin
dayjs.extend(isSameOrBefore); // Extend dayjs

// Ensure your Gemini API key is set in environment variables
const API_KEY = process.env.GEMINI_API_KEY;
if (!API_KEY) {
  console.error("GEMINI_API_KEY is not set in environment variables.");
  // In a production app, you might want to throw an error or handle this more gracefully.
}
const genAI = new GoogleGenerativeAI(API_KEY);
const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });

// --- Helper Functions ---

// Function to escape string for JSON prompt
function escapeForPrompt(text) {
  if (typeof text !== 'string') return text;
  return text.replace(/"/g, '\\"').replace(/\n/g, '\\n');
}

// Function to get current 3-day cycle start date (always a Monday)
function getCycleStartDate(date) {
  let start = dayjs(date).startOf('week'); // Monday in most locales
  if (start.day() !== 1) { // If startOf('week') isn't Monday (e.g., Sunday for some locales)
      start = start.add(1, 'day'); // Adjust to Monday
  }
  return start.format('YYYY-MM-DD');
}


// Function to generate the 3-day schedule from the meal pool
async function generateScheduleFromPool(mealPool, recentlyUsedMealIds, targetMacros, targetCalories) {
  const schedule = [];
  const newlyUsedMealIds = []; // To track meals used in this new schedule
  const currentUsedIdsMap = new Map(recentlyUsedMealIds.map(item => [item.mealId, dayjs(item.usedDate)]));

  const availableMeals = {
    Breakfast: mealPool.filter(m => m.name === 'Breakfast'),
    Lunch: mealPool.filter(m => m.name === 'Lunch'),
    Dinner: mealPool.filter(m => m.name === 'Dinner'),
    Snack: mealPool.filter(m => m.name === 'Snack'), // Assuming snacks are also in pool, adjust if not
  };

  const today = dayjs();
  const cycleStart = getCycleStartDate(today);

  for (let i = 0; i < 3; i++) { // Generate 3 days
    const date = dayjs(cycleStart).add(i, 'day');
    const dayOfWeek = date.format('dddd'); // e.g., "Monday"

    const daySchedule = {
      date: date.format('YYYY-MM-DD'),
      dayOfWeek,
      breakfast: {},
      lunch: {},
      dinner: {},
      snack1: {}, // Initialize as empty for assignment
      snack2: {},
    };

    const mealTypes = ['Breakfast', 'Lunch', 'Dinner', 'Snack'];
    for (const type of mealTypes) {
      const filteredOptions = availableMeals[type].filter(meal => {
        // --- ADD THIS CONDITION ---
        // Exclude meals with "Leftover" in their dish name from being suggested as new meals
        if (meal.dish.toLowerCase().includes('leftover')) {
            return false;
        }
        // --- END ADDITION ---

        const lastUsed = currentUsedIdsMap.get(meal.id);
        // Only include if not recently used (within last 7 days from today)
        return !lastUsed || dayjs(today).diff(lastUsed, 'day') >= 7;
      });

      // Try to pick a unique meal for this slot within the 3-day cycle AND from filtered options
      let chosenMeal = null;
      for (const meal of filteredOptions) {
        if (!newlyUsedMealIds.includes(meal.id)) { // Ensure unique within this 3-day cycle
          chosenMeal = meal;
          break;
        }
      }

      if (chosenMeal) {
        daySchedule[type.toLowerCase()] = { mealId: chosenMeal.id };
        newlyUsedMealIds.push(chosenMeal.id); // Mark as used for this cycle
      } else {
        // Fallback: If not enough unique meals, pick the least recently used one
        // This is a safety net but ideally, mealPool is big enough
        const fallbackMeal = availableMeals[type]
            .sort((a, b) => {
                const aUsed = currentUsedIdsMap.get(a.id);
                const bUsed = currentUsedIdsMap.get(b.id);
                if (!aUsed && !bUsed) return 0;
                if (!aUsed) return -1; // Never used, prioritize
                if (!bUsed) return 1;
                return dayjs(aUsed).diff(dayjs(bUsed)); // Least recently used first
            })
            .find(meal => !newlyUsedMealIds.includes(meal.id)) || availableMeals[type][0]; // Fallback to any
        
        if (fallbackMeal) {
            daySchedule[type.toLowerCase()] = { mealId: fallbackMeal.id };
            newlyUsedMealIds.push(fallbackMeal.id);
        } else {
            console.warn(`No suitable meal found for ${type} on ${dayOfWeek}.`);
        }
      }
    }
    schedule.push(daySchedule);
  }

  // Update recentlyUsedMealIds for the database
  const updatedRecentlyUsed = recentlyUsedMealIds
    .filter(item => dayjs(today).diff(item.usedDate, 'day') < 7); // Keep only recent ones
  
  newlyUsedMealIds.forEach(id => {
    updatedRecentlyUsed.push({ mealId: id, usedDate: today.toDate() });
  });

  return { schedule, updatedRecentlyUsed };
}


// --- Main API Handler ---

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ message: 'Method Not Allowed' });
  }

  const { email, refresh } = req.query; // 'refresh=1' will force new meal pool generation

  if (!email) {
    return res.status(400).json({ message: 'Email parameter is required.' });
  }

  await dbConnect();

  try {
    const userProfile = await UserProfile.findOne({ email });
    if (!userProfile) {
      return res.status(404).json({ message: 'User profile not found. Please complete your profile.' });
    }

    const {
      fitnessGoal,
      targetCalories,
      targetMacros,
      dietaryPreferences,
      age, gender, height, weight, activityLevel, mealsPerDay
    } = userProfile;

    if (!targetCalories || !targetMacros) {
      return res.status(400).json({ message: 'Target calories and macros not calculated. Please update your profile.' });
    }

    let dietPlan = await DietPlan.findOne({ email });

    const today = dayjs();
    const currentCycleStart = getCycleStartDate(today);

    let needsNewMealPool = false;
    let needsNewSchedule = false;

    if (!dietPlan || !dietPlan.mealPool || dietPlan.mealPool.length < 15) {
      needsNewMealPool = true; // No plan, or insufficient meal pool
    } else if (dayjs(dietPlan.lastPoolGenerationDate).add(7, 'day').isBefore(today) || refresh === '1') {
      // Meal pool is older than 7 days, or forced refresh
      needsNewMealPool = true;
    }

    if (needsNewMealPool) {
      console.log(`[Diet] Generating new meal pool for ${email}...`);
      // --- Generate New Meal Pool with Gemini ---
      const numBreakfasts = 5;
      const numLunches = 5;
      const numDinners = 5;
      const numSnacks = mealsPerDay > 3 ? 3 : 0; // Generate a few snacks if user wants them

      const prompt = `
        You are an expert nutritionist and AI assistant. Your task is to generate a comprehensive 3-day meal plan template, providing multiple unique options for each main meal category (Breakfast, Lunch, Dinner) and a few snack options based on the user's profile and calorie/macro goals.

        **Instructions for Generation:**
        1.  **Format:** Respond ONLY with a single JSON object. Do not include any other text or markdown outside the JSON.
        2.  **Meal Pool:** Create a 'mealPool' array containing ${numBreakfasts} unique Breakfasts, ${numLunches} unique Lunches, ${numDinners} unique Dinners, and ${numSnacks} unique Snacks (if requested). Total ${numBreakfasts + numLunches + numDinners + numSnacks} unique meals.
        3.  **Meal Structure:** Each meal object in the 'mealPool' must have the following properties:
            * \`id\`: A unique string ID for the meal (e.g., "b1", "l2", "d3", "s1").
            * \`name\`: The meal category ("Breakfast", "Lunch", "Dinner", "Snack").
            * \`dish\`: A clear, descriptive name of the dish (e.g., "Scrambled Eggs with Spinach & Whole Wheat Toast").
            * \`ingredients\`: An array of strings, listing all ingredients with practical, measurable amounts (e.g., "2 large eggs", "1 cup spinach", "1 slice whole wheat toast", "1 tbsp olive oil").
            * \`preparation\`: A concise string describing how to prepare the dish.
            * \`estimatedCalories\`: An integer representing the approximate calories for this meal.
            * \`estimatedMacros\`: An object with \`protein\`, \`carbs\`, \`fats\` (integers in grams) for this meal.
        4.  **Calorie & Macro Distribution:** Aim for each daily set of chosen meals (one Breakfast, one Lunch, one Dinner, plus snacks if applicable) to collectively approximate the user's daily target calories (${targetCalories} kcal) and target macros (Protein: ${targetMacros.protein}g, Carbs: ${targetMacros.carbs}g, Fats: ${targetMacros.fats}g). Each individual meal's estimatedCalories and estimatedMacros should be proportionate.
        5.  **Variety & Repetition:** Ensure all ${numBreakfasts + numLunches + numDinners + numSnacks} meals in the 'mealPool' are distinct and offer good variety across the week.
        6.  **User Profile Integration:** Tailor meals to the user's profile:
            * **Goal:** ${fitnessGoal}
            * **Current Metrics:** Age: ${age}, Gender: ${gender}, Height: ${height}cm, Weight: ${weight}kg, Activity Level: ${activityLevel}
            * **Dietary Preferences:**
                * Diet Type: ${dietaryPreferences.dietType || "None"}
                * Allergies to avoid: ${dietaryPreferences.allergies?.join(', ') || 'None'}
                * Disliked foods to avoid: ${dietaryPreferences.dislikes?.join(', ') || 'None'}
                * Other notes: ${dietaryPreferences.otherNotes || 'None'}
            * **Meals per Day:** User prefers ${mealsPerDay} meals per day.
        7.  **General Notes & Tips:** Include a \`generalNotes\` array for overall dietary advice (e.g., hydration, portion control, listening to your body) and a \`flexibilityTips\` array for advice on swapping meals or adjusting to preferences.
        8.  **Avoid Generic Placeholders:** Do not suggest generic "Leftover" meals as part of the core meal pool. Each meal in the pool should be a specific, distinct dish with its own ingredients and preparation. If a "Leftover" concept is necessary, ensure it's presented in the 'flexibilityTips' or 'generalNotes' and refers to reusing a specific previous day's dish.


        **Example JSON Structure (do not include example values in your response):**
        \`\`\`json
        {
          "mealPool": [
            {
              "id": "b1",
              "name": "Breakfast",
              "dish": "...",
              "ingredients": ["...", "..."],
              "preparation": "...",
              "estimatedCalories": ...,
              "estimatedMacros": { "protein": ..., "carbs": ..., "fats": ... }
            },
            // ... more breakfast, lunch, dinner, snack meals
          ],
          "generalNotes": ["...", "..."],
          "flexibilityTips": ["...", "..."]
        }
        \`\`\`
        Generate the JSON response now:
      `;

      try {
        const result = await model.generateContent({
          contents: [{ role: 'user', parts: [{ text: prompt }] }],
          generationConfig: { responseMimeType: 'application/json' },
        });

        const responseJson = JSON.parse(result.response.text());
        const generatedMealPool = responseJson.mealPool;
        const generalNotes = responseJson.generalNotes || [];
        const flexibilityTips = responseJson.flexibilityTips || [];

        // Validate generated mealPool size
        if (!generatedMealPool || generatedMealPool.length < 15) {
          console.warn("[Diet] Gemini generated insufficient meals. Retrying or using fallback.");
          // Implement retry logic or use a static fallback meal pool
          return res.status(500).json({ message: "Failed to generate sufficient unique meals." });
        }

        // Initialize or update DietPlan document
        if (!dietPlan) {
          dietPlan = new DietPlan({ email });
        }
        dietPlan.mealPool = generatedMealPool;
        dietPlan.generalNotes = generalNotes; // Add to schema if needed
        dietPlan.flexibilityTips = flexibilityTips; // Add to schema if needed
        dietPlan.lastPoolGenerationDate = today.toDate();
        dietPlan.recentlyUsedMealIds = []; // Clear old usage history for a new pool
        dietPlan.targetCalories = targetCalories; // Store for easy frontend access
        dietPlan.targetMacros = targetMacros; // Store for easy frontend access
        dietPlan.goal = fitnessGoal;

      } catch (geminiError) {
        console.error('Gemini API call error:', geminiError);
        return res.status(500).json({ message: 'Failed to generate meal plan from AI.', error: geminiError.message });
      }
    } else {
      console.log(`[Diet] Using existing meal pool for ${email}.`);
    }

    // --- Generate/Update Current Schedule from Pool ---
    // Check if the current schedule is for the current 3-day cycle
    const isScheduleCurrent = dietPlan.currentScheduleStartDate && dayjs(dietPlan.currentScheduleStartDate).isSame(currentCycleStart, 'day');

    if (!isScheduleCurrent || dietPlan.currentSchedule.length === 0) {
      console.log(`[Diet] Generating new 3-day schedule for ${email}.`);
      const { schedule: newSchedule, updatedRecentlyUsed } = await generateScheduleFromPool(
        dietPlan.mealPool,
        dietPlan.recentlyUsedMealIds,
        targetMacros,
        targetCalories
      );
      dietPlan.currentSchedule = newSchedule;
      dietPlan.currentScheduleStartDate = dayjs(currentCycleStart).toDate();
      dietPlan.recentlyUsedMealIds = updatedRecentlyUsed;
    } else {
      console.log(`[Diet] Current schedule is valid for ${email}.`);
    }
    
    // Save the DietPlan document (either new or updated)
    await dietPlan.save();

    // Prepare response data for the frontend
    const responseSchedule = dietPlan.currentSchedule.map(dayEntry => {
        const fullDay = { ...dayEntry._doc }; // Use _doc to get plain object from Mongoose sub-doc
        // Populate meal details from mealPool
        for (const mealType of ['breakfast', 'lunch', 'dinner', 'snack1', 'snack2']) {
            if (fullDay[mealType] && fullDay[mealType].mealId) {
                const mealDetails = dietPlan.mealPool.find(m => m.id === fullDay[mealType].mealId);
                if (mealDetails) {
                    fullDay[mealType] = { ...fullDay[mealType]._doc, ...mealDetails._doc };
                }
            }
        }
        return fullDay;
    });


    res.status(200).json({
      message: 'Diet plan fetched/generated successfully.',
      plan: {
        currentSchedule: responseSchedule,
        targetCalories: dietPlan.targetCalories,
        targetMacros: dietPlan.targetMacros,
        generalNotes: dietPlan.generalNotes,
        flexibilityTips: dietPlan.flexibilityTips,
        mealPool: dietPlan.mealPool, 
        // Add any other relevant meta-data here
      },
    });

  } catch (error) {
    console.error('Failed to process diet plan request:', error);
    res.status(500).json({ message: 'Internal Server Error', error: error.message });
  }
}