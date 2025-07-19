// pages/api/diet/log-meal.js
import dbConnect from '@/lib/mongodb';
import DietPlan from '@/models/DietPlan';
import dayjs from 'dayjs';

export default async function handler(req, res) {
  if (req.method !== 'PUT') {
    return res.status(405).json({ message: 'Method Not Allowed' });
  }

  const { email, date, mealType, mealId, customMealData } = req.body;

  if (!email || !date || !mealType) {
    return res.status(400).json({ message: 'Missing required parameters: email, date, and mealType.' });
  }

  // Ensure mealType is a valid key for the schema
  const validMealTypes = ['breakfast', 'lunch', 'dinner', 'snack1', 'snack2'];
  if (!validMealTypes.includes(mealType)) {
    return res.status(400).json({ message: `Invalid mealType: ${mealType}.` });
  }

  // Check if either mealId or customMealData is provided
  if (!mealId && !customMealData) {
    return res.status(400).json({ message: 'Either mealId or customMealData must be provided.' });
  }

  await dbConnect();

  try {
    const dietPlan = await DietPlan.findOne({ email });

    if (!dietPlan) {
      return res.status(404).json({ message: 'Diet plan not found for this user.' });
    }

    // Parse the currentSchedule content from the DietPlan document
    // (Assuming currentSchedule is stored as an array of objects directly in the schema,
    // if stored as string, you'd parse it here.)
    let currentSchedule = dietPlan.currentSchedule; // Directly use the Mongoose array

    // Find the specific day in the schedule
    const dayToUpdate = currentSchedule.find(d => d.date === date);

    if (!dayToUpdate) {
      return res.status(404).json({ message: `No schedule found for date: ${date}.` });
    }

    // Prepare the update object for the specific meal slot
    let updatedMealSlot = {};

    if (mealId) {
      // User selected an AI-suggested meal
      const mealFromPool = dietPlan.mealPool.find(m => m.id === mealId);
      if (!mealFromPool) {
        return res.status(404).json({ message: 'Selected meal ID not found in meal pool.' });
      }
      updatedMealSlot = {
        mealId: mealId,
        logged: true,
        loggedAt: dayjs().toDate(),
        customDish: undefined, // Clear custom data if switching to suggested
        customIngredients: undefined,
        customPreparation: undefined,
        customCalories: undefined,
        customMacros: undefined,
      };
    } else if (customMealData) {
      // User entered a custom meal
      if (!customMealData.dish || !customMealData.calories || !customMealData.macros) {
        return res.status(400).json({ message: 'Custom meal data requires dish, calories, and macros.' });
      }
      updatedMealSlot = {
        mealId: undefined, // Clear mealId if switching to custom
        logged: true,
        loggedAt: dayjs().toDate(),
        customDish: customMealData.dish,
        customIngredients: customMealData.ingredients || [],
        customPreparation: customMealData.preparation || '',
        customCalories: customMealData.calories,
        customMacros: customMealData.macros,
      };
    }

    // Apply the update to the specific meal type for the day
    dayToUpdate[mealType] = updatedMealSlot;

    // Mark the document as modified (important for nested objects/arrays in Mongoose)
    dietPlan.markModified('currentSchedule');

    await dietPlan.save();

    res.status(200).json({
      message: 'Meal logged successfully.',
      updatedSchedule: dietPlan.currentSchedule,
    });

  } catch (error) {
    console.error('Error logging meal:', error);
    res.status(500).json({ message: 'Internal Server Error', error: error.message });
  }
}