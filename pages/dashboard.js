import { useSession } from "next-auth/react";
import { useRouter } from "next/router";
import { useEffect, useState, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import dayjs from "dayjs";
import relativeTime from "dayjs/plugin/relativeTime";
import isSameOrBefore from "dayjs/plugin/isSameOrBefore";
import isSameOrAfter from "dayjs/plugin/isSameOrAfter";
import { Scale, CheckCircle2, TrendingUp, CalendarDays } from 'lucide-react';
dayjs.extend(relativeTime);
dayjs.extend(isSameOrBefore);
dayjs.extend(isSameOrAfter);

const StatCard = ({ title, value, suffix = "", icon: Icon, themeColor }) => (
  <motion.div
    whileHover={{ scale: 1.03, boxShadow: "0 10px 40px 0 rgba(6, 182, 212, 0.5)" }}
    className={`bg-white/10 p-4 rounded-2xl border border-white/20 w-full text-center flex flex-col items-center justify-center backdrop-blur-sm transition-all duration-200 shadow-md ${themeColor === "red" ? 'text-red-400' : 'text-emerald-400'}`}
  >
    {Icon && (
      <div className="mb-2">
        <Icon className={`w-8 h-8 ${themeColor === "red" ? 'text-red-400' : 'text-cyan-400'}`} />
      </div>
    )}
    <p className="text-sm font-semibold text-gray-200 mb-1">{title}</p>
    <p className="text-3xl font-semibold">
      {value}{suffix}
    </p>
  </motion.div>
);

const NavButton = ({ label, ...rest }) => (
  <motion.button {...rest}
    whileHover={{ scale: 1.05 }}
    whileTap={{ scale: 0.95 }}
    className="px-6 py-3 rounded-xl bg-gradient-to-r from-cyan-600 to-emerald-600 hover:from-cyan-700 hover:to-emerald-700 text-base font-medium text-center shadow-lg hover:shadow-xl transition-all duration-200 ease-in-out"
  >{label}</motion.button>
);

function EditSheet({ open, init, onSave, onClose }) {
  const [form, setForm] = useState(init);
  useEffect(() => {
    if (init && open) {
      setForm(init);
    }
  }, [init, open]);
  if (!open) return null;

  const set = k => e => setForm({
    ...form,
    [k]: e.target.type === 'checkbox' ? e.target.checked : e.target.value
  });

  return (
    <AnimatePresence>
      <motion.div key="sheet" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
        className="fixed inset-0 z-50 flex items-center justify-end bg-black/70"
        onClick={onClose}
      >
        <motion.div
          onClick={e => e.stopPropagation()}
          initial={{ x: 300 }} animate={{ x: 0 }} exit={{ x: 300 }}
          className="w-full max-w-md bg-gray-900 p-8 rounded-l-2xl shadow-2xl border-l border-white/20"
        >
          <h3 className="text-2xl font-bold text-cyan-300 mb-6">
            {dayjs().format("MMM D, YYYY")} &mdash; Log Today
          </h3>
          <label className="flex items-center gap-3 mt-4 text-lg font-medium text-gray-200">
            <input type="checkbox" checked={form.completed} onChange={set('completed')}
              className="form-checkbox h-5 w-5 text-cyan-600 rounded border-gray-600 bg-gray-700 focus:ring-cyan-500" />
            Workout completed
          </label>
          {['weight', 'calories', 'metric1', 'metric2'].map((k, i) => (
            <input key={k}
              type="number"
              placeholder={['Weight (kg)', 'Calories', 'Protein (g)', 'Steps'][i]}
              value={form[k] ?? ''}
              onChange={set(k)}
              className="w-full mt-4 bg-gray-800 border border-gray-700 rounded-lg px-4 py-3 text-base text-white placeholder-gray-500 focus:border-cyan-400 focus:ring-1 focus:ring-cyan-400 outline-none transition-all duration-200"
            />
          ))}
          <div className="mt-8 flex justify-end gap-4">
            <button onClick={onClose} className="text-base px-6 py-3 rounded-lg bg-gray-700 hover:bg-gray-600 transition-colors duration-200 text-white font-medium">Cancel</button>
            <button onClick={() => onSave({
              completed: form.completed,
              weight: parseFloat(form.weight),
              calories: parseInt(form.calories),
              metric1: parseInt(form.metric1),
              metric2: parseInt(form.metric2),
            })}
              className="text-base px-6 py-3 rounded-lg bg-cyan-600 hover:bg-cyan-700 transition-colors duration-200 text-white font-medium shadow-md">Save</button>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}

const HoverCard = ({ show, x, y, info }) => show && (
  <motion.div className="fixed z-50 pointer-events-none"
    initial={{ opacity: 0, scale: 0.85 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0 }}
    style={{ top: y + 10, left: x + 10 }}
  >
    <div className="bg-gray-900/95 text-gray-100 text-sm p-4 rounded-lg border border-white/30 shadow-2xl backdrop-blur-sm">
      <p className="font-semibold mb-2 text-lg text-emerald-300">{dayjs(info.date).format("MMM D, YYYY")}</p>
      <p className="flex items-center gap-2 mb-1"><span className="font-medium text-gray-400">Workout:</span> {info.completed ? "✅ Completed" : "❌ Not Completed"}</p>
      <p className="flex items-center gap-2 mb-1"><span className="font-medium text-gray-400">Weight:</span> {info.weight ? `${info.weight} kg` : "--"}</p>
      <p className="flex items-center gap-2 mb-1"><span className="font-medium text-gray-400">Calories:</span> {info.calories ?? "--"}</p>
      <p className="flex items-center gap-2 mb-1"><span className="font-medium text-gray-400">Protein:</span> {info.metric1 ? `${info.metric1} g` : "--"}</p>
      <p className="flex items-center gap-2"><span className="font-medium text-gray-400">Steps:</span> {info.metric2 ?? "--"}</p>
    </div>
  </motion.div>
);

const Cell = ({ dayStr, inPlan, data, onHover, onLeave, onClick }) => {
  const today = dayStr === dayjs().format("YYYY-MM-DD");
  const done = data?.completed;
  const base = inPlan
    ? done ? "bg-emerald-600/80 hover:bg-emerald-500" : today ? "bg-yellow-500/80 animate-pulse hover:bg-yellow-400" : "bg-cyan-700/70 hover:bg-cyan-600"
    : "bg-white/15 cursor-not-allowed";
  return (
    <div onMouseEnter={e => inPlan && onHover(e, dayStr, data)}
      onMouseLeave={onLeave}
      onClick={() => today && onClick()}
      className={`${base} h-10 w-10 flex items-center justify-center text-sm font-semibold rounded-lg border border-white/10 transition-all duration-200 ease-in-out ${inPlan ? 'cursor-pointer hover:ring-2 hover:ring-white/40' : ''}`}
    >
      {dayjs(dayStr).date()}
    </div>
  );
};

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
          className="block w-4 h-4 rounded-full bg-gradient-to-r from-cyan-400 to-emerald-400"
          variants={dotVariants}
          initial="initial"
          animate="animate"
          transition={{ ...dotVariants.animate.transition, delay: i * 0.2 }}
        />
      ))}
    </div>
    <p>{message}</p>
  </div>
);

export default function Dashboard() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [profile, setProfile] = useState(null);
  const [plan, setPlan] = useState({ startDate: null, durationWeeks: 0 });
  const [logs, setLogs] = useState([]);
  const [hover, setHover] = useState({ show: false, x: 0, y: 0, info: {} });
  const [sheetOpen, setSheetOpen] = useState(false);
  const [sheetInit, setSheetInit] = useState({});
  const [tips, setTips] = useState([]);

  const refreshLogs = async () => {
    const res = await fetch(`/api/progress/days?email=${session.user.email}`);
    const data = await res.json();
    const arr = Object.entries(data || {}).map(([d, v]) => ({ date: d, ...v }));

    arr.sort((a, b) => dayjs(b.date).diff(dayjs(a.date)));
    setLogs(arr);
  };

  useEffect(() => {
    if (status !== "authenticated") return;
    (async () => {
      const pRes = await fetch(`/api/profile?email=${session.user.email}`);
      const p = await pRes.json();
      if (!p?.fitnessGoal) return router.replace("/profile");
      setProfile(p);

      const mRes = await fetch(`/api/plan-meta?email=${session.user.email}`);
      setPlan(await mRes.json());
      await refreshLogs();
      setLoading(false);
    })();
  }, [status, session, router]);

  const logMap = Object.fromEntries(logs.map(l => [l.date, l]));
  const totalDays = plan.durationWeeks * 7;
  const completedDays = logs.filter(l => l.completed).length;
  const progressPct = totalDays ? Math.round((completedDays / totalDays) * 100) : 0;

  const [month, setMonth] = useState(dayjs().startOf("month"));
  const start = month.startOf("week"), end = month.endOf("month").endOf("week");
  const daysArr = []; for (let d = start.clone(); d.isSameOrBefore(end); d = d.add(1, 'day')) daysArr.push(d);

  const planStart = dayjs(plan.startDate), planEnd = planStart.add(totalDays - 1, 'day');
  const inPlanRange = d => d.isSameOrAfter(planStart, 'day') && d.isSameOrBefore(planEnd, 'day');

  const today = dayjs().format("YYYY-MM-DD");
  const openTodaySheet = () => {
    setSheetInit({ completed: logMap[today]?.completed || false, ...logMap[today] });
    setSheetOpen(true);
  };
  const saveSheet = async payload => {
    await fetch(`/api/progress?email=${session.user.email}`, {
      method: "POST", headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ date: today, ...payload })
    });
    setSheetOpen(false);
    refreshLogs();
  };

  // Memoize tips & prevent fetch re-runs
  const tipsForDisplay = useMemo(() => {
    const doneToday = logMap[today]?.completed;
    const t = tips.length ? tips : [
      doneToday
        ? "Great job! Ensure full recovery tonight."
        : "Stay hydrated & have a light warm‑up before your workout.",
      doneToday
        ? "Plan tomorrow’s workout to stay ahead."
        : "Focus on form first, then build intensity.",
      doneToday
        ? "Stretch thoroughly and sleep well."
        : "Log weight & calories post workout.",
      doneToday
        ? "Nutrition matters: include protein."
        : "Cooldown after exercise to aid recovery.",
      doneToday
        ? "Consistency builds progress—stay strong!"
        : "Track steps today for daily movement."
    ];
    return t;
  }, [tips, logMap, today]);

  if (status === "loading" || loading) return <PulsatingDotLoader message="Loading dashboard..." />;

  return (
    <div className="min-h-screen flex flex-col lg:flex-row gap-8 p-6 lg:p-10 text-white font-sans">
      <EditSheet open={sheetOpen} init={sheetInit} onSave={saveSheet} onClose={() => setSheetOpen(false)} />
      <AnimatePresence>
        {hover.show && <HoverCard {...hover} />}
      </AnimatePresence>

      {/* Left Pane - Main Content Area */}
      <div className="flex-1 space-y-8 lg:space-y-10">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
          <h1 className="text-4xl font-extrabold text-white leading-tight">Welcome back, <span className="bg-clip-text text-transparent bg-gradient-to-r from-cyan-400 to-emerald-400 drop-shadow-lg">{session.user.name || "Athlete"}</span>!</h1>
          <p className="text-lg text-gray-300 mt-2">Your fitness goal: <span className="font-semibold text-cyan-300">{profile.fitnessGoal}</span></p>
        </motion.div>

        {/* Stat Cards */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2, duration: 0.5 }}
          className="grid grid-cols-2 md:grid-cols-4 gap-6"
        >
          <StatCard title="Current Weight" value={logMap[today]?.weight ?? logs.find(l => l.weight)?.weight ?? "--"} suffix="kg" icon={Scale} themeColor="cyan" />
          <StatCard title="Workouts Completed" value={`${completedDays}/${totalDays}`} icon={CheckCircle2} themeColor="emerald" />
          <StatCard title="Overall Progress" value={`${progressPct}%`} icon={TrendingUp} themeColor="cyan" />
          <StatCard title="Today's Workout" value={logMap[today]?.completed ? "✅ Done" : "❌ Pending"} icon={CalendarDays} themeColor={logMap[today]?.completed ? "emerald" : "red"} />
        </motion.div>

        {/* Progress Bar */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4, duration: 0.5 }}
          className="w-full bg-gray-800 rounded-full h-3 overflow-hidden shadow-inner"
        >
          <div
            className="h-full bg-gradient-to-r from-green-400 to-emerald-500 rounded-full transition-all duration-500 ease-out"
            style={{ width: `${progressPct}%` }}
          />
        </motion.div>

        {/* Navigation Buttons */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6, duration: 0.5 }}
          className="flex flex-wrap px-10 gap-10 justify-center md:justify-start"
        >
          <NavButton onClick={() => router.push("/workouts")} label="Explore Workouts" />
          <NavButton onClick={() => router.push("/diet")} label="Manage Diet" />
          <NavButton onClick={openTodaySheet} label="Log Today's Progress" />
        </motion.div>

        {/* Recent Activity/Achievements Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.8, duration: 0.5 }}
          className="bg-gray-800/60 p-6 rounded-2xl border border-white/10 shadow-lg"
        >
          <h2 className="text-2xl font-bold text-cyan-300 mb-4">Recent Activity & Achievements</h2>
          <ul className="space-y-3">
            {logs.slice(0, 3).map((log, index) => (
              <li key={index} className="flex items-center justify-between text-gray-300 text-md">
                <span>
                  {dayjs(log.date).format("MMM D")}: {log.completed ? "Workout completed" : "Workout missed"}
                  {log.weight && ` | Weight: ${log.weight}kg`}
                </span>
                <span className={`px-3 py-1 rounded-full text-xs font-semibold ${log.completed ? 'bg-emerald-700 text-white' : 'bg-red-700 text-white'}`}>
                  {log.completed ? "Logged" : "Pending"}
                </span>
              </li>
            ))}
            {logs.length === 0 && (
              <p className="text-gray-400 italic">No activity logged yet. Start logging your progress!</p>
            )}
            {completedDays >= totalDays * 0.5 && totalDays > 0 && (
              <li className="flex items-center gap-3 text-emerald-400 font-semibold text-md mt-4">
                🏆 You've completed over 50% of your plan! Keep pushing!
              </li>
            )}
          </ul>
        </motion.div>
      </div>

      {/* Right Pane - Calendar and Tips */}
      <div className="w-full lg:w-[38%] flex flex-col items-center space-y-8">
        {/* Calendar */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3, duration: 0.5 }}
          className="bg-gray-800/60 rounded-2xl border border-white/10 p-6 w-full shadow-lg"
        >
          <div className="flex justify-between items-center text-lg mb-4 font-semibold text-gray-200">
            <motion.button
              whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }}
              onClick={() => setMonth(month.subtract(1, 'month'))}
              className="p-2 rounded-full hover:bg-white/10 transition-colors"
            >&lt;</motion.button>
            <p className="text-xl font-bold text-cyan-300">{month.format("MMMM YYYY")}</p>
            <motion.button
              whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }}
              onClick={() => setMonth(month.add(1, 'month'))}
              className="p-2 rounded-full hover:bg-white/10 transition-colors"
            >&gt;</motion.button>
          </div>
          <div className="grid grid-cols-7 text-center text-sm text-gray-400 mb-3 font-medium">
            {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map(d => <div key={d} className="h-8 flex items-center justify-center">{d}</div>)}
          </div>
          <div className="grid grid-cols-7 gap-2">
            {daysArr.map(d => {
              const dstr = d.format("YYYY-MM-DD");
              return (
                <Cell key={dstr} dayStr={dstr}
                  inPlan={inPlanRange(d)} data={logMap[dstr]}
                  onHover={(e, day, data) => setHover({ show: true, x: e.clientX, y: e.clientY, info: { date: day, ...data } })}
                  onLeave={() => setHover(h => ({ ...h, show: false }))}
                  onClick={openTodaySheet}
                />
              )
            })}
          </div>
        </motion.div>

        {/* Tips Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5, duration: 0.5 }}
          className="w-full bg-gray-800/60 p-6 rounded-2xl border border-white/10 shadow-lg"
        >
          <h2 className="font-bold text-2xl text-cyan-300 mb-4">
            {logMap[today]?.completed ? "Tips for Tomorrow" : "Daily Insights"}:
          </h2>
          <ul className="list-disc list-inside text-base text-gray-200 space-y-2">
            {tipsForDisplay.map((tip, i) => (
              <li key={i} className="leading-relaxed">{tip}</li>
            ))}
          </ul>
        </motion.div>
      </div>
    </div>
  );
}
