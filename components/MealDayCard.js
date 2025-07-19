// components/MealDayCard.js
import { motion } from 'framer-motion';
import dayjs from 'dayjs'; // Already installed with dayjs
import isToday from 'dayjs/plugin/isToday'; // Re-use the plugin
dayjs.extend(isToday);

// Variants for individual meal cards inside the daily card
const mealCardVariants = {
  hidden: { opacity: 0, x: -20 },
  visible: { opacity: 1, x: 0, transition: { duration: 0.3 } },
};

export default function MealDayCard({ dayData, mealPool, onLogMeal, onOpenCustomMealModal, isToday }) {
  const mealTypesOrder = ['breakfast', 'lunch', 'dinner', 'snack1', 'snack2']; // Define order of display

  // Function to get the full meal details (either from pool or custom)
  const getMealDetails = (mealSlot) => {
    if (!mealSlot) return null;

    if (mealSlot.logged && mealSlot.customDish) {
      // It's a custom logged meal
      return {
        isCustom: true,
        dish: mealSlot.customDish,
        ingredients: mealSlot.customIngredients,
        preparation: mealSlot.customPreparation,
        estimatedCalories: mealSlot.customCalories,
        estimatedMacros: mealSlot.customMacros,
      };
    } else if (mealSlot.mealId) {
      // It's an AI-suggested meal from the pool
      return mealPool.find(m => m.id === mealSlot.mealId);
    }
    return null; // No meal assigned or logged
  };

  const calculateDailyTotals = () => {
    let totalCalories = 0;
    let totalProtein = 0;
    let totalCarbs = 0;
    let totalFats = 0;

    for (const type of mealTypesOrder) {
      const meal = getMealDetails(dayData[type]);
      if (meal && meal.logged) { // Only sum up if the meal was actually logged
        totalCalories += meal.estimatedCalories || meal.customCalories || 0;
        totalProtein += meal.estimatedMacros?.protein || meal.customMacros?.protein || 0;
        totalCarbs += meal.estimatedMacros?.carbs || meal.customMacros?.carbs || 0;
        totalFats += meal.estimatedMacros?.fats || meal.customMacros?.fats || 0;
      }
    }
    return { totalCalories, totalProtein, totalCarbs, totalFats };
  };

  const { totalCalories, totalProtein, totalCarbs, totalFats } = calculateDailyTotals();

  return (
    <motion.div
      className={`bg-white/10 rounded-xl shadow-xl p-6 border ${isToday ? 'border-teal-500' : 'border-white/20'} relative overflow-hidden`}
      initial={{ opacity: 0, y: 50 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -50 }}
      transition={{ duration: 0.5 }}
    >
      {isToday && (
        <span className="absolute top-0 right-0 bg-teal-500 text-gray-900 text-xs font-bold px-3 py-1 rounded-bl-lg">TODAY</span>
      )}
      <h3 className="text-3xl font-bold text-center text-orange-400 mb-6 drop-shadow">
        {dayjs(dayData.date).format('dddd, MMMM D')}
      </h3>

      {/* Daily Summary of Logged Meals */}
      <div className="bg-white/10 p-4 rounded-lg mb-6 shadow-inner border-white/20">
        <h4 className="text-xl font-semibold text-white mb-2">Logged Totals:</h4>
        <p className="text-gray-300">Calories: <span className="font-bold">{totalCalories} kcal</span></p>
        <p className="text-gray-300">Protein: <span className="font-bold">{totalProtein}g</span> | Carbs: <span className="font-bold">{totalCarbs}g</span> | Fats: <span className="font-bold">{totalFats}g</span></p>
      </div>


      <div className="space-y-6">
        {mealTypesOrder.map(type => {
          const mealSlot = dayData[type];
          const mealDetails = getMealDetails(mealSlot);
          const logged = mealSlot?.logged || false;
          const isCustom = mealDetails?.isCustom || false; // Check if it's a custom meal
          const mealNameDisplay = type.charAt(0).toUpperCase() + type.slice(1).replace(/\d+/g, ''); // Breakfast, Lunch, Snack etc.

          return (
            <motion.div
              key={type}
              className={`bg-white/10 p-4 rounded-lg shadow-md border ${logged ? 'border-green-500' : 'border-white/20'}`}
              variants={mealCardVariants}
            >
              <h4 className="text-xl font-semibold text-blue-300 mb-2">{mealNameDisplay}</h4>
              {mealDetails ? (
                <div>
                  <p className="text-lg font-bold text-white mb-1">
                    {mealDetails.dish} {isCustom && <span className="text-sm text-yellow-400">(Your Meal)</span>}
                  </p>
                  <p className="text-sm text-gray-400 mb-2">
                    {mealDetails.estimatedCalories || mealDetails.customCalories} kcal | P:{mealDetails.estimatedMacros?.protein || mealDetails.customMacros?.protein}g C:{mealDetails.estimatedMacros?.carbs || mealDetails.customMacros?.carbs}g F:{mealDetails.estimatedMacros?.fats || mealDetails.customMacros?.fats}g
                  </p>
                  {logged && (
                    <p className="text-xs text-green-400 mt-1">
                      Logged at: {dayjs(mealSlot.loggedAt).format('h:mm A')}
                    </p>
                  )}
                  <p className="text-gray-300 text-sm mb-2">{mealDetails.ingredients?.join(', ')}</p>
                  <p className="text-gray-300 text-sm">{mealDetails.preparation}</p>

                  <div className="mt-3 flex flex-wrap gap-2">
                    {!logged && ( // Only show "Log This" if not already logged
                      <button
                        onClick={() => onLogMeal(dayData.date, type, mealDetails.id)}
                        className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-md text-sm font-semibold transition-colors duration-200"
                      >
                        Log This Meal
                      </button>
                    )}
                    <button
                      onClick={() => onOpenCustomMealModal(dayData.date, type)}
                      className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-md text-sm font-semibold transition-colors duration-200"
                    >
                      Log My Own Meal
                    </button>
                    {/* Optionally, add a "Swap/Choose Another" button here
                        This would fetch other options from the mealPool and display them
                        For now, we'll keep it simple to avoid another modal/component.
                    */}
                  </div>
                </div>
              ) : (
                <div className="text-gray-400 text-center py-4">
                  <p>No meal suggestion available.</p>
                  <button
                    onClick={() => onOpenCustomMealModal(dayData.date, type)}
                    className="mt-3 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-md text-sm font-semibold transition-colors duration-200"
                  >
                    Log My Own Meal
                  </button>
                </div>
              )}
            </motion.div>
          );
        })}
      </div>
    </motion.div>
  );
}