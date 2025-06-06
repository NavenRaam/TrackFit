import { useSession } from "next-auth/react";
import { useRouter } from "next/router";
import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import ProfileDisplay from "@/components/ProfileDisplay";

export default function Profile() {
  const { data: session, status } = useSession();
  const router = useRouter();

  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [editMode, setEditMode] = useState(true);
  const [profile, setProfile] = useState(null);
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
    workoutDays: "",
    preferredWorkouts: "",
    workoutLocation: "",
    allergies: "",
    maintenanceCalories: "",
  });

  useEffect(() => {
    if (!session) return;

    async function fetchProfile() {
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
            workoutDays: data.workoutDays || "",
            preferredWorkouts: Array.isArray(data.preferredWorkouts) ? data.preferredWorkouts.join(", ") : "",
            workoutLocation: data.workoutLocation || "",
            allergies: Array.isArray(data.allergies) ? data.allergies.join(", ") : "",
            maintenanceCalories: data.maintenanceCalories || "",
          });
          setEditMode(false);
          setStep(1);
        } else {
          setEditMode(true);
          setStep(1);
        }
      } else {
        setEditMode(true);
        setStep(1);
      }
    }
    fetchProfile();
  }, [session]);

  if (status === "loading") return <p className="text-center text-white">Loading...</p>;
  if (!session) return <p className="text-center text-white">Access denied. Please log in.</p>;

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleNext = () => {
    setStep(2);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    const preparedData = {
      ...form,
      mealsPerDay: Number(form.mealsPerDay),
      targetWeight: Number(form.targetWeight),
      maintenanceCalories: Number(form.maintenanceCalories),
      workoutDays: Number(form.workoutDays),
      durationWeeks: Number(form.durationWeeks),
      preferredWorkouts: form.preferredWorkouts
        ? form.preferredWorkouts.split(",").map((w) => w.trim()).filter(Boolean)
        : [],
      allergies: form.allergies
        ? form.allergies.split(",").map((a) => a.trim()).filter(Boolean)
        : [],
      email: session.user.email,
    };

    try {
      const res = await fetch("/api/profile", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(preparedData),
      });

      if (res.ok) {
        setProfile(preparedData);
        setEditMode(false);
        setStep(1);
      } else {
        alert("Failed to save profile");
      }
    } catch (error) {
      alert("An error occurred. Please try again.");
    }
    setLoading(false);
  };

  if (!editMode && profile) {
  return (
    <ProfileDisplay
      session={session}
      profile={profile}
      onEdit={() => setEditMode(true)}
    />
  );
}

  return (
    <div className="w-full flex items-center justify-center px-4 py-2 mb-24">
      <motion.div
        className="w-full max-w-2xl bg-white/10 backdrop-blur-2xl shadow-2xl border border-white/20 rounded-3xl p-10 text-white"
        initial={{ opacity: 0, y: 40 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ type: "spring", stiffness: 100, damping: 14 }}
      >
        <h1 className="text-4xl font-extrabold text-center mb-8 tracking-wider bg-gradient-to-r from-purple-400 via-sky-300 to-purple-500 bg-clip-text text-transparent">
          {step === 1 ? "Complete Your Profile" : "Customize Your Plan"}
        </h1>

        <form
          onSubmit={step === 1 ? (e) => { e.preventDefault(); handleNext(); } : handleSubmit}
          className="space-y-6"
        >
          {step === 1 && (
            <div className="grid grid-cols-2 gap-4">
              {["age", "height", "weight"].map((field) => (
                <div key={field}>
                  <label className="block mb-1 capitalize text-sm">{field}</label>
                  <input
                    type="number"
                    name={field}
                    value={form[field]}
                    onChange={handleChange}
                    required
                    className="w-full px-4 py-2 rounded-lg bg-white/20 focus:outline-none focus:ring-2 focus:ring-sky-400 text-white placeholder:text-white/60"
                    placeholder={`Enter ${field}`}
                  />
                </div>
              ))}
              <div>
                <label className="block mb-1 text-sm">Gender</label>
                <select
                  name="gender"
                  value={form.gender}
                  onChange={handleChange}
                  required
                  className="w-full px-4 py-2 rounded-lg bg-white/20 focus:outline-none focus:ring-2 focus:ring-sky-400 text-white"
                >
                  <option value="">Select</option>
                  <option>Male</option>
                  <option>Female</option>
                  <option>Other</option>
                </select>
              </div>
              <div>
                <label className="block mb-1 text-sm">Fitness Goal</label>
                <select
                  name="fitnessGoal"
                  value={form.fitnessGoal}
                  onChange={handleChange}
                  required
                  className="w-full px-4 py-2 rounded-lg bg-white/20 focus:outline-none focus:ring-2 focus:ring-sky-400 text-white"
                >
                  <option value="">Select</option>
                  <option>Lose Weight</option>
                  <option>Gain Muscle</option>
                  <option>Maintain</option>
                </select>
              </div>
              <div className="col-span-2">
                <label className="block mb-1 text-sm">Activity Level</label>
                <select
                  name="activityLevel"
                  value={form.activityLevel}
                  onChange={handleChange}
                  required
                  className="w-full px-4 py-2 rounded-lg bg-white/20 focus:outline-none focus:ring-2 focus:ring-sky-400 text-white"
                >
                  <option value="">Select</option>
                  <option>Sedentary</option>
                  <option>Lightly Active</option>
                  <option>Moderately Active</option>
                  <option>Very Active</option>
                </select>
              </div>
            </div>
          )}

          {step === 2 && (
            <div className="grid grid-cols-2 gap-4">
              <input
                name="targetWeight"
                type="number"
                value={form.targetWeight}
                onChange={handleChange}
                placeholder="Target Weight"
                className="px-4 py-2 rounded-lg bg-white/20 text-white"
              />
              <input
                name="durationWeeks"
                type="number"
                value={form.durationWeeks}
                onChange={handleChange}
                placeholder="Duration (weeks)"
                className="px-4 py-2 rounded-lg bg-white/20 text-white"
              />
              <input
                name="dietType"
                type="text"
                value={form.dietType}
                onChange={handleChange}
                placeholder="Diet Type"
                className="px-4 py-2 rounded-lg bg-white/20 text-white"
              />
              <input
                name="mealsPerDay"
                type="number"
                value={form.mealsPerDay}
                onChange={handleChange}
                placeholder="Meals per Day"
                className="px-4 py-2 rounded-lg bg-white/20 text-white"
              />
              <input
                name="workoutDays"
                type="number"
                value={form.workoutDays}
                onChange={handleChange}
                placeholder="Workout Days/Week"
                className="px-4 py-2 rounded-lg bg-white/20 text-white"
              />
              <input
                name="preferredWorkouts"
                type="text"
                value={form.preferredWorkouts}
                onChange={handleChange}
                placeholder="Preferred Workouts (comma separated)"
                className="px-4 py-2 rounded-lg bg-white/20 text-white"
              />
              <input
                name="workoutLocation"
                type="text"
                value={form.workoutLocation}
                onChange={handleChange}
                placeholder="Workout Location"
                className="px-4 py-2 rounded-lg bg-white/20 text-white"
              />
              <input
                name="allergies"
                type="text"
                value={form.allergies}
                onChange={handleChange}
                placeholder="Allergies (comma separated)"
                className="px-4 py-2 rounded-lg bg-white/20 text-white"
              />
              <input
                name="maintenanceCalories"
                type="number"
                value={form.maintenanceCalories}
                onChange={handleChange}
                placeholder="Maintenance Calories"
                className="px-4 py-2 rounded-lg bg-white/20 text-white"
              />
            </div>
          )}

          <motion.button
            type="submit"
            disabled={loading}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="w-full py-3 mt-6 bg-gradient-to-r from-sky-500 to-purple-600 text-white font-bold text-lg rounded-xl shadow-lg hover:shadow-2xl transition-all"
          >
            {loading ? "Saving..." : step === 1 ? "Continue Profile" : "Save Profile"}
          </motion.button>
        </form>
      </motion.div>
    </div>
  );
}
