// pages/diet.js
import { useSession } from 'next-auth/react'; // Keep useSession for authentication
import { useRouter } from 'next/router'; // Keep useRouter for redirection
import { useEffect, useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { PulseLoader } from 'react-spinners'; // Import PulseLoader for loading state
import dayjs from 'dayjs';
import localizedFormat from 'dayjs/plugin/localizedFormat';
import utc from 'dayjs/plugin/utc';
import timezone from 'dayjs/plugin/timezone';
import isToday from 'dayjs/plugin/isToday'; // New plugin to easily check if a date is today

dayjs.extend(localizedFormat);
dayjs.extend(utc);
dayjs.extend(timezone);
dayjs.extend(isToday); // Extend dayjs with isToday

// --- IMPORTANT: Ensure these paths are correct for your project ---
import MealDayCard from '@/components/MealDayCard';       // We will create this next                // Use your existing Loader component
import CustomMealModal from '@/components/CustomMealModal'; // We will create this after MealDayCard

// Framer Motion variants for page entry
const pageVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.5,
      when: "beforeChildren",
      staggerChildren: 0.1,
    },
  },
  exit: { opacity: 0, y: -20, transition: { duration: 0.3 } },
};

// Framer Motion variants for individual sections
const sectionVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.5 } },
};

export default function DietPage() {
  const { data: session, status } = useSession();
  const router = useRouter(); // For redirection if not authenticated

  const [dietPlanData, setDietPlanData] = useState(null);
  const [loading, setLoading] = useState(true); // Initial loading for authentication + data fetch
  const [error, setError] = useState(null);
  const [isGenerating, setIsGenerating] = useState(false); // For specific generation loading state

  // State for custom meal modal
  const [showCustomMealModal, setShowCustomMealModal] = useState(false);
  const [currentMealSlotForCustom, setCurrentMealSlotForCustom] = useState(null); // { date, mealType }

  const email = session?.user?.email;

  // --- Data Fetching Logic ---
  const fetchDietPlan = useCallback(async (forceRefresh = false) => {
    if (!email) return; // Don't fetch if email is not available
    
    // Set loading state for data fetch, show specific message if forcing generation
    setLoading(true);
    setIsGenerating(forceRefresh); // Indicate if it's a generation
    setError(null);

    try {
      const queryParams = new URLSearchParams({ email });
      if (forceRefresh) {
        queryParams.append('refresh', '1');
      }

      const res = await fetch(`/api/diet-gemini?${queryParams.toString()}`);
      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.message || 'Failed to fetch diet plan.');
      }
      setDietPlanData(data.plan);
    } catch (err) {
      console.error("Error fetching diet plan:", err);
      setError(err.message);
    } finally {
      setLoading(false);
      setIsGenerating(false); // Reset generation state
    }
  }, [email]); // Recreate if email changes

  // --- Meal Logging/Custom Meal Logic ---
  const handleLogMeal = useCallback(async (date, mealType, mealId, customMealData = null) => {
    // This is an update, so we can show a more subtle loading or none if it's fast
    setError(null); 
    try {
      const res = await fetch('/api/diet/log-meal', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, date, mealType, mealId, customMealData }),
      });
      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.message || 'Failed to log meal.');
      }

      // Optimistically update local state to reflect the change immediately
      setDietPlanData(prevData => {
        if (!prevData || !prevData.currentSchedule) return null; // Defensive check
        
        const updatedSchedule = prevData.currentSchedule.map(day => {
          if (day.date === date) {
            const updatedDay = { ...day };
            // Ensure the nested meal object is deeply copied or merged
            if (mealId) { // Logged AI suggestion
                const mealDetails = prevData.mealPool.find(m => m.id === mealId);
                // Merge existing assignment data with pool details for display
                updatedDay[mealType] = { 
                    ...(updatedDay[mealType] || {}), // Keep existing logging fields if any
                    mealId, 
                    logged: true, 
                    loggedAt: dayjs().toDate(), 
                    ...mealDetails // Spread meal details for easy access in display
                }; 
            } else if (customMealData) { // Logged custom meal
                updatedDay[mealType] = { 
                    logged: true, 
                    loggedAt: dayjs().toDate(), 
                    customDish: customMealData.dish,
                    customIngredients: customMealData.ingredients || [],
                    customPreparation: customMealData.preparation || '',
                    customCalories: customMealData.calories,
                    customMacros: customMealData.macros,
                    mealId: undefined // Ensure mealId is cleared for custom meals
                };
            }
            return updatedDay;
          }
          return day;
        });
        return { ...prevData, currentSchedule: updatedSchedule };
      });
      // Optionally, show a toast notification for success
    } catch (err) {
      console.error("Error logging meal:", err);
      setError(err.message);
      // Optionally, show a toast notification for error
    } finally {
      // If you added a specific loading state for logging, turn it off here
    }
  }, [email]); // Recreate if email changes

  // --- Custom Meal Modal Handlers ---
  const openCustomMealModal = useCallback((date, mealType) => {
    setCurrentMealSlotForCustom({ date, mealType });
    setShowCustomMealModal(true);
  }, []);

  const closeCustomMealModal = useCallback(() => {
    setShowCustomMealModal(false);
    setCurrentMealSlotForCustom(null);
  }, []);

  const handleSubmitCustomMeal = useCallback((customData) => {
    if (currentMealSlotForCustom) {
      handleLogMeal(
        currentMealSlotForCustom.date,
        currentMealSlotForCustom.mealType,
        null, // No mealId for custom meal
        customData
      );
    }
    closeCustomMealModal();
  }, [currentMealSlotForCustom, handleLogMeal, closeCustomMealModal]);

  // --- Generate New Plan Handler ---
  const handleGenerateNewPlan = useCallback(() => {
    if (window.confirm("Generating a new plan will replace your current suggestions. Are you sure?")) {
      fetchDietPlan(true); // Force refresh/generation
    }
  }, [fetchDietPlan]);

  // --- Initial Data Fetch Effect ---
  useEffect(() => {
    // Only fetch if authenticated and email is available
    if (status === 'authenticated' && email) {
      fetchDietPlan();
    }
  }, [status, email, fetchDietPlan]); // Dependencies for useEffect

  // --- Authentication and Initial Loading States ---
  const dotVariants = {
  initial: { opacity: 0.4, scale: 0.8 },
  animate: {
    opacity: 1,
    scale: 1,
    transition: {
      duration: 0.8,
      repeat: Infinity,
      repeatType: "reverse",
      ease: "easeInOut",
    },
  },
};

const PulsatingDotLoader = ({ message = "Loading..." }) => (
  <div className="min-h-screen flex flex-col items-center justify-center text-white text-xl p-6">
    <div className="flex space-x-2 mb-4">
      {[...Array(3)].map((_, i) => (
        <motion.span
          key={i}
          className="block w-4 h-4 rounded-full bg-gradient-to-r from-sky-400 to-purple-500"
          variants={dotVariants}
          initial="initial"
          animate="animate"
          transition={{ ...dotVariants.animate.transition, delay: i * 0.2 }} // Staggered animation
        />
      ))}
    </div>
    <p>{message}</p>
  </div>
);

  if (status === 'loading' || loading) {
        return (
            <div className="flex justify-center items-center min-h-screen">
                <PulseLoader color="#06B6D4" size={15} />
            </div>
        );
  }

  if (!session) {
    router.replace("/"); // Redirect to login if not authenticated
    return null; // Don't render anything further
  }

  // --- Primary Content Loading States ---
  if (loading && !dietPlanData) { // Show initial loading for the diet plan data
    return <Loader message={isGenerating ? "Crafting your new meal plan..." : "Loading your diet plan..."} />;
  }

  // --- Error State ---
  if (error) {
    return (
      <motion.div
        className="text-red-500 text-center mt-8 p-6 bg-red-900/20 rounded-xl border border-red-800 shadow-lg max-w-lg mx-auto"
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
      >
        <p className="font-bold text-xl mb-3">Error Loading Diet Plan!</p>
        <p className="mb-4">{error}</p>
        <button
          onClick={() => fetchDietPlan()}
          className="px-6 py-2 bg-blue-600 hover:bg-blue-700 rounded-lg text-white font-semibold transition-colors duration-200"
        >
          Try Again
        </button>
        {isGenerating && <p className="text-sm mt-2">If generation failed, you might try again later or check your API key.</p>}
      </motion.div>
    );
  }

  // --- No Plan Data State (e.g., first-time user) ---
  if (!dietPlanData || !dietPlanData.currentSchedule || dietPlanData.currentSchedule.length === 0) {
    return (
      <motion.div
        className="text-white text-center mt-8 p-6 bg-gray-800 rounded-xl shadow-lg border border-gray-700 max-w-lg mx-auto"
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
      >
        <p className="text-xl mb-4">You don't have a diet plan yet!</p>
        <button
          onClick={handleGenerateNewPlan}
          className="px-8 py-3 bg-green-600 hover:bg-green-700 rounded-lg text-white font-semibold text-lg shadow-md transition-colors duration-200"
          disabled={isGenerating}
        >
          {isGenerating ? "Generating..." : "Generate My First Diet Plan"}
        </button>
      </motion.div>
    );
  }

  // --- Main Content Display ---
  const { currentSchedule, targetCalories, targetMacros, generalNotes, flexibilityTips, mealPool } = dietPlanData;
  const todayDate = dayjs().tz(dayjs.tz.guess()).format('YYYY-MM-DD'); // Get today's date in local timezone
  console.log("dietPlanData:", dietPlanData); // Add this line
  console.log("mealPool being passed:", mealPool);

  return (
    <motion.div
      className="min-h-screen text-white px-4 sm:p-8"
      initial="hidden"
      animate="visible"
      exit="exit" // For exit animation if using AnimatePresence around the page component
      variants={pageVariants}
    >
      <div className="max-w-7xl mx-auto">
        <motion.h1
          className="text-4xl sm:text-5xl font-extrabold text-center mb-8 bg-clip-text text-transparent bg-gradient-to-r from-sky-400 to-purple-500 tracking-tight"
          variants={sectionVariants}
        >
          Your Personalized Diet Plan
        </motion.h1>

        {/* Overall Calorie & Macro Summary */}
        <motion.div
          className="bg-white/10 p-6 rounded-xl shadow-lg border border-white/20 mb-8 text-center"
          variants={sectionVariants}
        >
          <h2 className="text-2xl font-bold text-green-400 mb-3">Daily Nutritional Goals</h2>
          <p className="text-lg">
            Calories: <span className="font-semibold text-white">{targetCalories || 'N/A'} kcal</span>
          </p>
          <p className="text-lg">
            Macros: Protein <span className="font-semibold text-white">{targetMacros?.protein || 'N/A'}g</span> |{' '}
            Carbs <span className="font-semibold text-white">{targetMacros?.carbs || 'N/A'}g</span> |{' '}
            Fats <span className="font-semibold text-white">{targetMacros?.fats || 'N/A'}g</span>
          </p>
        </motion.div>

        {/* General Notes & Flexibility Tips */}
        {(generalNotes?.length > 0 || flexibilityTips?.length > 0) && (
            <motion.div
            className="bg-gray-800 p-6 rounded-xl shadow-lg border border-gray-700 mb-8"
            variants={sectionVariants}
            >
            <h2 className="text-2xl font-bold text-blue-400 mb-3">Important Notes & Tips</h2>
            <ul className="list-disc list-inside text-white/80 space-y-2">
                {(generalNotes || []).map((note, index) => (
                <li key={`note-${index}`}>{note}</li>
                ))}
                {(flexibilityTips || []).map((tip, index) => (
                    <li key={`tip-${index}`}>{tip}</li>
                ))}
            </ul>
            </motion.div>
        )}

        {/* Generate New Plan Button */}
        <motion.div
          className="text-center mb-8"
          variants={sectionVariants}
        >
          <button
            onClick={handleGenerateNewPlan}
            className="px-8 py-3 bg-purple-600 hover:bg-purple-700 rounded-lg text-white font-semibold text-lg shadow-md transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-opacity-75"
            disabled={isGenerating || loading}
          >
            {isGenerating ? "Generating New Plan..." : "Generate New Weekly Meal Plan"}
          </button>
          {isGenerating && (
              <p className="mt-2 text-sm text-gray-400">This might take a moment as AI crafts your meals.</p>
          )}
        </motion.div>

        {/* Daily Meal Cards Grid */}
        <motion.div 
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
            variants={sectionVariants} // Apply stagger to children here
        >
          <AnimatePresence>
            {currentSchedule.map((dayData) => (
              <MealDayCard
                key={dayData.date} // Use date as key for stability
                dayData={dayData}
                mealPool={mealPool} // Pass the full meal pool for lookup
                onLogMeal={handleLogMeal}
                onOpenCustomMealModal={openCustomMealModal}
                isToday={dayjs(dayData.date).isToday()} // Check if this day is today
              />
            ))}
          </AnimatePresence>
        </motion.div>
      </div>

      {/* Custom Meal Modal */}
      <AnimatePresence>
        {showCustomMealModal && (
          <CustomMealModal
            onClose={closeCustomMealModal}
            onSubmit={handleSubmitCustomMeal}
          />
        )}
      </AnimatePresence>
    </motion.div>
  );
}