import { useState } from "react";
import { motion } from "framer-motion";// Ensure global styles are imported
import {
  FaUser, FaHeartbeat, FaDumbbell, FaClipboardList,
  FaWeight, FaCalendarAlt, FaBicycle, FaUtensils, FaUserEdit
} from "react-icons/fa";

function InfoCard({ icon: Icon, label, value }) {
  return (
    <div className="bg-white/10 rounded-xl p-4 h-full flex items-start gap-3 shadow-md border border-white/20">
      <Icon className="text-2xl text-sky-400 mt-1" />
      <div>
        <p className="text-sm text-white/70 leading-tight">{label}</p>
        <p className="font-semibold leading-tight text-base">{value || "N/A"}</p>
      </div>
    </div>
  );
}

export default function ProfileDisplay({ session, profile, onEdit }) {
  const [activeTab, setActiveTab] = useState("basic");

  const completeness = Math.min(
    (
      [
        profile.age, profile.gender, profile.height, profile.weight,
        profile.fitnessGoal, profile.activityLevel, profile.targetWeight,
        profile.durationWeeks, profile.dietType, profile.mealsPerDay,
        profile.workoutDays, profile.preferredWorkouts?.length,
        profile.workoutLocation, profile.allergies?.length,
        profile.maintenanceCalories
      ].filter(Boolean).length / 15
    ) * 100,
    100
  );

  return (
    <div className="flex flex-col justify-start text-white">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-12 py-10"
      >
        <h2 className="text-3xl chivo-mono font-bold mb-8 text-center">
          Hello, {session.user.name || session.user.email}
        </h2>

        {/* Completion Indicator */}
        <div className="flex justify-center mb-10">
          <div className="relative w-32 h-32">
            <svg className="w-full h-full">
              <circle cx="50%" cy="50%" r="50" stroke="white" strokeOpacity="0.1" strokeWidth="12" fill="none" />
              <motion.circle
                cx="50%" cy="50%" r="50"
                stroke="url(#gradient)" strokeWidth="12" fill="none"
                strokeDasharray={314}
                strokeDashoffset={314 - (314 * completeness) / 100}
                initial={{ strokeDashoffset: 314 }}
                animate={{ strokeDashoffset: 314 - (314 * completeness) / 100 }}
                transition={{ duration: 1.5, ease: "easeOut" }}
                strokeLinecap="round"
              />
              <defs>
                <linearGradient id="gradient" x1="1" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#38bdf8" />
                  <stop offset="100%" stopColor="#a855f7" />
                </linearGradient>
              </defs>
            </svg>
            <div className="absolute inset-0 flex items-center justify-center font-bold text-xl">
              {Math.round(completeness)}%
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex justify-center space-x-4 mb-8">
          <button
            onClick={() => setActiveTab("basic")}
            className={`px-4 py-2 rounded-full ${
              activeTab === "basic" ? "bg-sky-600" : "bg-white/10"
            }`}
          >
            <FaUser className="inline mr-1" /> Basic Info
          </button>
          <button
            onClick={() => setActiveTab("plan")}
            className={`px-4 py-2 rounded-full ${
              activeTab === "plan" ? "bg-sky-600" : "bg-white/10"
            }`}
          >
            <FaClipboardList className="inline mr-1" /> Plan Details
          </button>
        </div>

        {/* Tab Content */}
        {activeTab === "basic" ? (
          <motion.div
            key="basic"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4"
          >
            <InfoCard icon={FaCalendarAlt} label="Age" value={profile.age} />
            <InfoCard icon={FaUser} label="Gender" value={profile.gender} />
            <InfoCard icon={FaHeartbeat} label="Height (cm)" value={profile.height} />
            <InfoCard icon={FaWeight} label="Weight (kg)" value={profile.weight} />
            <InfoCard icon={FaDumbbell} label="Fitness Goal" value={profile.fitnessGoal} />
            <InfoCard icon={FaBicycle} label="Activity Level" value={profile.activityLevel} />
          </motion.div>
        ) : (
          <motion.div
            key="plan"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4"
          >
            {profile.fitnessGoal === "Gain Muscle" ? (
              <>
                <InfoCard icon={FaWeight} label="Target Weight" value={profile.targetWeight + " kg"} />
                <InfoCard icon={FaCalendarAlt} label="Duration" value={profile.durationWeeks + " weeks"} />
                <InfoCard icon={FaDumbbell} label="Workout Days" value={profile.workoutDays + " days/week"} />
                <InfoCard icon={FaUtensils} label="Diet Type" value={profile.dietType} />
                <InfoCard icon={FaUtensils} label="Meals Per Day" value={profile.mealsPerDay} />
                <InfoCard icon={FaDumbbell} label="Workout Location" value={profile.workoutLocation} />
                <InfoCard icon={FaDumbbell} label="Maintenance Calories" value={profile.maintenanceCalories + " kcal"} />
                <InfoCard icon={FaDumbbell} label="Preferred Workouts" value={profile.preferredWorkouts?.join(", ") || "None"} />
                <InfoCard icon={FaUtensils} label="Allergies" value={profile.allergies?.join(", ") || "None"} />
              </>
            ) : (
              <div className="text-center text-white/60 col-span-full">
                Plan details are shown only for the &quot;Gain Muscle&quot; goal.
              </div>
            )}
          </motion.div>
        )}

        {/* Edit Button */}
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={onEdit}
          className="mt-12 w-full py-3 bg-gradient-to-r from-purple-600 to-sky-500 font-bold rounded-xl shadow-lg hover:shadow-2xl"
        >
          <FaUserEdit className="inline mr-2" /> Edit Profile
        </motion.button>
      </motion.div>
    </div>
  );
}
