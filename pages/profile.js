import { useSession } from "next-auth/react";
import { useRouter } from "next/router";
import { useState, useEffect, useCallback } from "react"; // Added useCallback
import { motion, AnimatePresence } from "framer-motion"; // Added AnimatePresence
import ProfileDisplay from "@/components/ProfileDisplay"; // Assuming this component exists

// --- Framer Motion Variants for smooth transitions ---
const formVariants = {
  hidden: { opacity: 0, y: 30, scale: 0.98 },
  visible: { opacity: 1, y: 0, scale: 1, transition: { type: "spring", stiffness: 100, damping: 14 } },
  exit: { opacity: 0, y: -20, scale: 0.98, transition: { duration: 0.2 } } // For step transitions
};

const inputFieldVariants = {
  hidden: { opacity: 0, x: -10 },
  visible: { opacity: 1, x: 0, transition: { type: "tween", duration: 0.2 } }
};

const buttonVariants = {
  hover: { scale: 1.05, boxShadow: "0 0 15px rgba(78, 178, 255, 0.4), 0 0 25px rgba(168, 85, 247, 0.3)" },
  tap: { scale: 0.95 }
};

export default function Profile() {
  const { data: session, status } = useSession();
  const router = useRouter();

  // ------------- state -------------
  const [step, setStep] = useState(1); // 1 = basics, 2 = goal-specific, 3 = advanced diet/workout
  const [loading, setLoading] = useState(false);
  const [editMode, setEditMode] = useState(true); // true = show form
  const [profile, setProfile] = useState(null);
  const [notification, setNotification] = useState({ message: '', type: '' }); // For success/error messages

  const [form, setForm] = useState({
    age: "",
    gender: "",
    height: "",
    weight: "",
    fitnessGoal: "",
    activityLevel: "",
    targetWeight: "",
    durationWeeks: "",
    dietType: "",
    mealsPerDay: "",
    workoutDaysPerWeek: "", // Changed to match API/DB field name (previously workoutDays)
    preferredWorkouts: "",
    workoutLocation: "",
    allergies: "",
    maintenanceCalories: "",
    experienceLevel: "", // Added experienceLevel
    preferredWorkoutDurationMinutes: "" // Added preferredWorkoutDurationMinutes
  });

  // ------------- fetch existing profile -------------
  const fetchProfile = useCallback(async () => {
    if (!session?.user?.email) return;
    setLoading(true);
    try {
      const res = await fetch(`/api/profile?email=${encodeURIComponent(session.user.email)}`);
      if (res.ok) {
        const data = await res.json();
        if (data) {
          setProfile(data);
          setForm({
            age: data.age || "",
            gender: data.gender || "",
            height: data.height || "",
            weight: data.weight || "",
            fitnessGoal: data.fitnessGoal || "",
            activityLevel: data.activityLevel || "",
            targetWeight: data.targetWeight || "",
            durationWeeks: data.durationWeeks || "",
            dietType: data.dietType || "",
            mealsPerDay: data.mealsPerDay || "",
            workoutDaysPerWeek: data.workoutDaysPerWeek || "", // Ensure this matches
            preferredWorkouts: Array.isArray(data.preferredWorkouts) ? data.preferredWorkouts.join(", ") : "",
            workoutLocation: data.workoutLocation || "",
            allergies: Array.isArray(data.allergies) ? data.allergies.join(", ") : "",
            maintenanceCalories: data.maintenanceCalories || "",
            experienceLevel: data.experienceLevel || "", // Load this
            preferredWorkoutDurationMinutes: data.preferredWorkoutDurationMinutes || "" // Load this
          });
          setEditMode(false);
        } else {
            // Profile exists but is empty/null, keep edit mode
            setEditMode(true);
        }
      } else {
        // No existing profile found (e.g., 404), start in edit mode
        setEditMode(true);
      }
    } catch (error) {
      console.error("Failed to fetch profile:", error);
      setNotification({ message: 'Failed to load profile. Please try again.', type: 'error' });
      setEditMode(true); // Force edit mode on fetch error
    } finally {
      setLoading(false);
    }
  }, [session]); // Dependency on session

  useEffect(() => {
    if (status === "authenticated") {
      fetchProfile();
    }
  }, [status, fetchProfile]);

  // If already authenticated and profile loaded, and not in edit mode, display it
  if (status === "authenticated" && !editMode && profile) {
    return <ProfileDisplay session={session} profile={profile} onEdit={() => setEditMode(true)} />;
  }

  // Handle loading and unauthenticated states
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

  if (status === "loading" || loading) return <PulsatingDotLoader message="Loading profile..." />;
  if (!session) return <AccessDeniedMessage />;


  // ------------- handlers -------------
  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleNext = () => {
    // Basic validation before moving to next step
    if (step === 1) {
        if (!form.age || !form.gender || !form.height || !form.weight || !form.fitnessGoal || !form.activityLevel) {
            setNotification({ message: "Please fill all basic details.", type: "error" });
            return;
        }
    }
    setNotification({ message: '', type: '' }); // Clear any previous notification
    setStep(prev => prev + 1);
  };

  const handlePrevious = () => {
    setNotification({ message: '', type: '' }); // Clear any previous notification
    setStep(prev => prev - 1);
  };

  // ... (rest of the code before handleSubmit remains the same) ...

 const handleSubmit = async (e) => {
 e.preventDefault();
 setLoading(true);
 setNotification({ message: '', type: '' }); // Clear notification on submit

 const prepared = {
 ...form,
 mealsPerDay: Number(form.mealsPerDay) || undefined,
 targetWeight: Number(form.targetWeight) || undefined,
 maintenanceCalories: Number(form.maintenanceCalories) || undefined,
 workoutDaysPerWeek: Number(form.workoutDaysPerWeek) || undefined,
 durationWeeks: Number(form.durationWeeks) || undefined,
 preferredWorkoutDurationMinutes: Number(form.preferredWorkoutDurationMinutes) || undefined,
 preferredWorkouts: form.preferredWorkouts ? form.preferredWorkouts.split(",").map((w) => w.trim()).filter(Boolean) : [],
 allergies: form.allergies ? form.allergies.split(",").map((a) => a.trim()).filter(Boolean) : [],
 email: session.user.email,
 };

 try {
 const res = await fetch("/api/profile", {
 method: "POST",
 headers: { "Content-Type": "application/json" },
 body: JSON.stringify(prepared),
 });

 if (res.ok) {
 const updatedProfileData = await res.json(); // <-- AWAIT the response JSON
 setProfile(updatedProfileData); 
 setEditMode(false);
 setStep(1); // Reset step to 1 after saving
 setNotification({ message: "Profile saved successfully!", type: "success" });
 } else {
const errorData = await res.json();
setNotification({ message: errorData.error || "Failed to save profile. Please check your inputs.", type: "error" });
 }
} catch (error) {
 console.error("Save profile error:", error);
 setNotification({ message: "An unexpected error occurred. Please try again.", type: "error" });
 } finally {
 setLoading(false);
 }
 };

// ... (rest of the code after handleSubmit remains the same) ...


  // ------------- form (edit mode) -------------
  return (
    <div className="w-full flex items-center justify-center min-h-screen px-4 py-12">
      <motion.div
        className="w-full max-w-3xl bg-white/10 backdrop-blur-2xl shadow-2xl border border-white/20 rounded-3xl p-8 sm:p-10 text-white relative overflow-hidden"
        initial={{ opacity: 0, y: 40 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ type: "spring", stiffness: 100, damping: 14 }}
      >
        <h1 className="text-3xl sm:text-4xl font-extrabold text-center mb-6 sm:mb-8 tracking-wider bg-gradient-to-r from-purple-400 via-sky-300 to-purple-500 bg-clip-text text-transparent">
          {step === 1 ? "Tell Us About Yourself" : step === 2 ? "Your Fitness Preferences" : "Advanced Customization"}
        </h1>

        {/* Progress Indicator */}
        <div className="flex justify-center mb-8">
          {[1, 2, 3].map((s) => (
            <div key={s} className="flex items-center">
              <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm border-2 ${
                step >= s ? "bg-sky-500 border-sky-500" : "bg-white/10 border-white/30"
              } ${step === s ? "ring-2 ring-sky-300 scale-110" : ""}`}>
                {s}
              </div>
              {s < 3 && <div className={`h-1 w-12 mx-2 rounded-full ${step > s ? "bg-sky-500" : "bg-white/20"}`}></div>}
            </div>
          ))}
        </div>

        {/* Notification Area */}
        <AnimatePresence>
            {notification.message && (
                <motion.div
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -20 }}
                    className={`p-3 rounded-lg text-center text-sm mb-6 ${
                        notification.type === 'success' ? 'bg-green-600/30 text-green-300 border border-green-500' :
                        'bg-red-600/30 text-red-300 border border-red-500'
                    }`}
                >
                    {notification.message}
                </motion.div>
            )}
        </AnimatePresence>


        <form onSubmit={(e) => { e.preventDefault(); step === 3 ? handleSubmit(e) : handleNext(); }} className="space-y-6">
          <AnimatePresence mode="wait">
            {/* ----- Step 1: Basic Info ----- */}
            {step === 1 && (
              <motion.div
                key="step1"
                variants={formVariants}
                initial="hidden"
                animate="visible"
                exit="exit"
                className="grid grid-cols-1 sm:grid-cols-2 gap-6"
              >
                <InputField type="number" label="Age" name="age" value={form.age} onChange={handleChange} placeholder="e.g., 30" />
                <SelectField label="Gender" name="gender" value={form.gender} onChange={handleChange} options={["Male", "Female", "Other"]} />
                <InputField type="number" label="Height (cm)" name="height" value={form.height} onChange={handleChange} placeholder="e.g., 175" />
                <InputField type="number" label="Weight (kg)" name="weight" value={form.weight} onChange={handleChange} placeholder="e.g., 70" />
                <SelectField label="Fitness Goal" name="fitnessGoal" value={form.fitnessGoal} onChange={handleChange} options={["Lose Weight", "Gain Muscle", "Maintain", "Improve Endurance"]} className="col-span-full" />
                <SelectField label="Activity Level" name="activityLevel" value={form.activityLevel} onChange={handleChange} options={["Sedentary (little to no exercise)", "Lightly Active (light exercise/sports 1-3 days/week)", "Moderately Active (moderate exercise/sports 3-5 days/week)", "Very Active (hard exercise/sports 6-7 days/week)", "Extra Active (very hard exercise/physical job)"]} className="col-span-full" />
              </motion.div>
            )}

            {/* ----- Step 2: Goal-Specific Info ----- */}
            {step === 2 && (
              <motion.div
                key="step2"
                variants={formVariants}
                initial="hidden"
                animate="visible"
                exit="exit"
                className="grid grid-cols-1 sm:grid-cols-2 gap-6"
              >
                {form.fitnessGoal === 'Lose Weight' && (
                    <InputField type="number" label="Target Weight (kg)" name="targetWeight" value={form.targetWeight} onChange={handleChange} placeholder="e.g., 65" />
                )}
                {form.fitnessGoal === 'Gain Muscle' && (
                    <InputField type="number" label="Target Weight (kg)" name="targetWeight" value={form.targetWeight} onChange={handleChange} placeholder="e.g., 75" />
                )}
                <InputField type="number" label="Plan Duration (weeks)" name="durationWeeks" value={form.durationWeeks} onChange={handleChange} placeholder="e.g., 12" />
                <SelectField label="Experience Level" name="experienceLevel" value={form.experienceLevel} onChange={handleChange} options={["Beginner", "Intermediate", "Advanced"]} />
                <InputField type="number" label="Workout Days / Week" name="workoutDaysPerWeek" value={form.workoutDaysPerWeek} onChange={handleChange} placeholder="e.g., 4" />
                <InputField type="number" label="Preferred Workout Duration (mins)" name="preferredWorkoutDurationMinutes" value={form.preferredWorkoutDurationMinutes} onChange={handleChange} placeholder="e.g., 60" />
                <InputField type="text" label="Workout Location" name="workoutLocation" value={form.workoutLocation} onChange={handleChange} placeholder="e.g., Gym, Home, Outdoors" />
                <InputField type="text" label="Preferred Workouts (comma-separated)" name="preferredWorkouts" value={form.preferredWorkouts} onChange={handleChange} placeholder="e.g., Weightlifting, Yoga, Running" className="col-span-full" />
              </motion.div>
            )}

            {/* ----- Step 3: Diet & Other Info ----- */}
            {step === 3 && (
              <motion.div
                key="step3"
                variants={formVariants}
                initial="hidden"
                animate="visible"
                exit="exit"
                className="grid grid-cols-1 sm:grid-cols-2 gap-6"
              >
                <InputField type="text" label="Diet Type" name="dietType" value={form.dietType} onChange={handleChange} placeholder="e.g., Vegetarian, Keto, Paleo" />
                <InputField type="number" label="Meals per Day" name="mealsPerDay" value={form.mealsPerDay} onChange={handleChange} placeholder="e.g., 3" />
                <InputField type="text" label="Allergies (comma-separated)" name="allergies" value={form.allergies} onChange={handleChange} placeholder="e.g., Peanuts, Dairy, Gluten" className="col-span-full" />
                {form.fitnessGoal === 'Maintain' && (
                  <InputField type="number" label="Maintenance Calories" name="maintenanceCalories" value={form.maintenanceCalories} onChange={handleChange} placeholder="e.g., 2000" className="col-span-full" />
                )}
              </motion.div>
            )}
          </AnimatePresence>

          {/* Navigation Buttons */}
          <div className="flex justify-between items-center pt-4">
            {step > 1 && (
              <motion.button
                type="button"
                onClick={handlePrevious}
                className="px-6 py-2 rounded-lg text-white font-semibold border border-white/30 hover:bg-white/10 transition-colors"
                variants={buttonVariants}
                whileHover="hover"
                whileTap="tap"
              >
                Previous
              </motion.button>
            )}

            <motion.button
              type="submit"
              disabled={loading}
              className={`py-3 px-8 rounded-full text-white font-bold text-lg shadow-lg transition-all duration-300 focus:outline-none focus:ring-4 focus:ring-opacity-50
                ${loading ? "bg-gray-600 cursor-not-allowed" : "bg-gradient-to-r from-sky-500 to-purple-600 hover:shadow-2xl focus:ring-sky-500"}`}
              variants={buttonVariants}
              whileHover="hover"
              whileTap="tap"
            >
              {loading ? (
                <span className="flex items-center">
                  <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  {step === 3 ? 'Saving...' : 'Validating...'}
                </span>
              ) : (
                step === 3 ? 'Save Profile' : 'Next Step'
              )}
            </motion.button>
          </div>
        </form>
      </motion.div>
    </div>
  );
}

// ----- Reusable Form Components (Enhanced) -----

const InputField = ({ label, name, value, onChange, type = "text", placeholder, className = "" }) => (
  <motion.div variants={inputFieldVariants} className={`relative group ${className}`}>
    <label className="block mb-1 text-sm font-medium text-white/80 group-focus-within:text-sky-300 transition-colors duration-200 capitalize">
      {label}
    </label>
    <input
      type={type}
      name={name}
      value={value}
      onChange={onChange}
      placeholder={placeholder}
      className="w-full px-4 py-2.5 rounded-lg bg-white/15 text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-sky-400 focus:bg-white/20 transition-all duration-200 border border-white/20"
      required // Most fields should probably be required
    />
  </motion.div>
);

const SelectField = ({ label, name, value, onChange, options, className = "" }) => (
  <motion.div variants={inputFieldVariants} className={`relative group ${className}`}>
    <label className="block mb-1 text-sm font-medium text-white/80 group-focus-within:text-sky-300 transition-colors duration-200 capitalize">
      {label}
    </label>
    <select
      name={name}
      value={value}
      onChange={onChange}
      className="w-full px-4 py-2.5 rounded-lg bg-white/15 text-white focus:outline-none focus:ring-2 focus:ring-sky-400 focus:bg-white/20 transition-all duration-200 border border-white/20 appearance-none pr-8"
      required // Most fields should probably be required
    >
      <option value="" disabled className="bg-gray-800 text-white/70">Select an option</option> {/* Placeholder */}
      {options.map((opt) => (
        <option key={opt} value={opt} className="bg-gray-800 text-white">{opt}</option>
      ))}
    </select>
    {/* Custom arrow for select */}
    <div className="absolute inset-y-0 right-0 flex items-center px-2 pointer-events-none top-6">
      <svg className="h-5 w-5 text-white/70" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
        <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
      </svg>
    </div>
  </motion.div>
);

// --- Simple Loading/Access Denied Components ---

const AccessDeniedMessage = () => (
  <div className="min-h-screen flex items-center justify-center text-white text-xl p-6">
    <p>Access denied. Please log in to view or update your profile.</p>
  </div>
);