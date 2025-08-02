import { useSession } from "next-auth/react";
import { useEffect, useState, useCallback } from "react";
import { motion } from "framer-motion";
import dayjs from "dayjs";
import relativeTime from "dayjs/plugin/relativeTime";

dayjs.extend(relativeTime);

// --- Framer Motion Variants (Centralized for consistency) ---
const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1, // Stagger initial load of sections/cards
      delayChildren: 0.2,
    },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { type: "spring", stiffness: 100, damping: 15 } },
};

/* ---------- small reusable day card ---------- */
function DayCard({ day, lines }) {
  return (
    <motion.div
      className="bg-gray-800/60 p-6 rounded-2xl border border-white/10 shadow-lg hover:shadow-2xl hover:border-cyan-400 transition-all duration-300 transform hover:-translate-y-2 backdrop-blur-sm"
      variants={itemVariants}
    >
      <h3 className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-cyan-400 to-emerald-400 mb-3 border-b border-white/20 pb-2">
        {day}
      </h3>
      <ul className="list-disc list-inside text-base text-gray-200 space-y-2">
        {lines.map((l, i) => (
          <li key={i}>{l}</li>
        ))}
      </ul>
    </motion.div>
  );
}

export default function WorkoutPage() {
  const { data: session, status } = useSession();
  const [loading, setLoading] = useState(false);
  const [planData, setPlanData] = useState({ days: {}, notes: [] });
  const [meta, setMeta] = useState({ startDate: null, durationWeeks: 0 });

  /* ---------- helpers ---------- */
  const transformJsonPlan = (plan) => {
    const out = { days: {}, notes: plan.info || [] };

    (plan.days || []).forEach((d) => {
      const heading = `${d.day} – ${d.title}`;
      const lines = (d.exercises || []).map((ex) => `${ex.name} – ${ex.sets}×${ex.reps}`);
      out.days[heading] = lines;
    });

    if (plan.progression?.length) out.notes.push(...plan.progression);
    setMeta({ startDate: plan.startDate || dayjs().format("YYYY-MM-DD"), durationWeeks: plan.durationWeeks || 8 });
    return out;
  };

  const isExpired = () => {
    if (!meta.startDate || !meta.durationWeeks) return true;
    return dayjs().isAfter(dayjs(meta.startDate).add(meta.durationWeeks, "week"));
  };

  /* ---------- fetch plan ---------- */
  // Wrap fetchPlan in useCallback to prevent unnecessary re-renders/lint warnings
  const fetchPlan = useCallback(async (force = false) => {
    if (!session?.user?.email) return;
    setLoading(true);
    try {
      const url = `/api/workout-gemini?email=${encodeURIComponent(session.user.email)}${force ? "&refresh=1" : ""}`;
      const res = await fetch(url);
      const data = await res.json();

      if (data.plan) setPlanData(transformJsonPlan(data.plan));
      else if (data.content) setPlanData(transformJsonPlan(parseLegacy(data.content))); // Make sure parseLegacy is defined or imported
      // Add a fallback if plan or content is missing, to clear old data
      else setPlanData({ days: {}, notes: [] });

    } catch (e) {
      console.error("Plan fetch error", e);
      // Optional: Add a user-facing error message here
    } finally {
      setLoading(false);
    }
  }, [session?.user?.email]); // Dependency on email

  /* ---------- initial load ---------- */
  useEffect(() => {
    if (status === "authenticated") fetchPlan();
  }, [status, fetchPlan]); // Add fetchPlan to dependencies because it's in useEffect

  if (status === "loading") return <p className="text-center text-white p-6 text-xl">Loading workout plan...</p>;
  if (!session) return <p className="text-center text-white p-6 text-xl">Please log in to view your workout plan.</p>;

  return (
    <motion.div
      className="max-w-7xl mx-auto px-6 text-white space-y-12"
      variants={containerVariants}
      initial="hidden"
      animate="visible"
    >
      <motion.h1
        className="text-4xl sm:text-5xl font-extrabold text-center bg-clip-text text-transparent bg-gradient-to-r from-cyan-400 to-emerald-400 tracking-tight drop-shadow-lg"
        variants={itemVariants}
      >
        Personalized Workout Plan
      </motion.h1>

      {/* regenerate only if plan ended */}
      {isExpired() && (
        <motion.div variants={itemVariants} className="text-center">
          <motion.button
            whileHover={{ scale: 1.07, boxShadow: "0 0 20px rgba(6, 182, 212, 0.6)" }}
            whileTap={{ scale: 0.95 }}
            onClick={() => fetchPlan(true)}
            className="inline-flex items-center justify-center bg-gradient-to-r from-cyan-600 to-emerald-600 px-8 py-3 rounded-full font-semibold text-lg shadow-lg hover:shadow-xl transition-all duration-300 focus:outline-none focus:ring-4 focus:ring-cyan-500 focus:ring-opacity-50"
          >
            {loading ? (
              <span className="flex items-center">
                <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Generating New Plan...
              </span>
            ) : (
              "Generate New Plan"
            )}
          </motion.button>
        </motion.div>
      )}

      {/* countdown */}
      {!isExpired() && (
        <motion.p
          className="text-center text-lg text-white/80"
          variants={itemVariants}
        >
          Plan ends {dayjs(meta.startDate).add(meta.durationWeeks, "week").fromNow()} — stay consistent and crush your goals!
        </motion.p>
      )}

      {/* notes */}
      {planData.notes.length > 0 && (
        <motion.div
          className="bg-gray-800/60 p-8 rounded-2xl border border-white/10 shadow-2xl backdrop-blur-sm"
          variants={itemVariants}
        >
          <h2 className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-cyan-400 to-emerald-400 mb-5 border-b border-white/20 pb-3">Important Notes</h2>
          <ul className="list-disc ml-8 text-base space-y-2 text-gray-200">
            {planData.notes.map((n, i) => (
              <motion.li key={i} variants={itemVariants}>{n}</motion.li>))}
          </ul>
        </motion.div>
      )}

      {/* day cards */}
      {Object.keys(planData.days).length > 0 && (
        <motion.div
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8"
          variants={containerVariants}
          initial="hidden"
          animate="visible"
        >
          {Object.entries(planData.days).map(([day, lines]) => (
            <DayCard key={day} day={day} lines={lines} />
          ))}
        </motion.div>
      )}
    </motion.div>
  );
}
