import React, { useState, useEffect } from 'react';
import { FitnessCenter, LocalDining, Timeline } from '@mui/icons-material';
import { motion, AnimatePresence } from 'framer-motion';
import { useRouter } from 'next/router';
import { FaDumbbell } from 'react-icons/fa';

const features = [
  {
    Icon: FitnessCenter,
    title: 'Custom Workouts',
    description: 'Step-by-step training plans tailored for newbies.',
    color: '#FF6B6B',
  },
  {
    Icon: LocalDining,
    title: 'Smart Nutrition',
    description: 'Simple meal guides designed to power your gains.',
    color: '#4ECDC4',
  },
  {
    Icon: Timeline,
    title: 'Progress Insights',
    description: 'Clear visual stats to track your fitness journey.',
    color: '#556270',
  },
];

export default function Home({ setCurrentView }) {
  const router = useRouter();
  const [testiIndex, setTestiIndex] = useState(0);
  const [coords, setCoords] = useState({ x: -100, y: -100 });
  const [showDumbbell, setShowDumbbell] = useState(false);

  useEffect(() => {
    const timer = setInterval(() => {
      setTestiIndex((prev) => (prev + 1) % 3);
    }, 5000);
    return () => clearInterval(timer);
  }, []);


  const handleClick = (e) => {
    setCoords({ x: e.clientX, y: e.clientY });
    setShowDumbbell(true);
    setTimeout(() => setShowDumbbell(false), 1000);
  };

  return (
    <AnimatePresence mode="wait">
      <motion.div
        key="home-landing"
        className="relative min-h-screen text-white flex flex-col items-center px-4 py-12"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: 20 }}
        transition={{ duration: 0.8 }}
        onClick={handleClick}
      >

        {/* Header */}
        <motion.header
          className="w-full max-w-6xl flex justify-between items-center mb-16"
          initial={{ y: -50, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: -50, opacity: 0 }}
          transition={{ delay: 0.2, duration: 0.6 }}
        >
          <h1 className="text-4xl font-bold tracking-wide select-none cursor-default">
            <span className="text-purple-500">Track</span>
            <span className="text-sky-600">Fit</span>
          </h1>
          <nav className="space-x-6">
            <motion.button
              onClick={() => router.push('/login')}
              className="text-white font-medium tracking-wide"
              whileHover={{
                scale: 1.1,
                rotate: -3.5,
                color: "#38bdf8",
                textShadow: "0px 0px 8px rgba(56, 189, 248, 1)",
              }}
              whileTap={{ scale: 0.95 }}
              transition={{ type: "spring", stiffness: 250, damping: 18 }}
            >
              Login
            </motion.button>
            <motion.button
              onClick={() => router.push('/login?signup=true')}
              className="self-start bg-gradient-to-r from-sky-500 to-sky-600 text-white px-5 py-2 rounded-full font-semibold shadow-lg tracking-wide"
              whileHover={{
                scale: 1.15,
                backgroundColor: "#38bdf8",
                boxShadow: "0px 6px 20px rgba(56, 189, 248, 1)",
                rotate: 1.5,
              }}
              whileTap={{
                scale: 0.9,
                rotate: -1,
                boxShadow: "0px 4px 12px rgba(56, 189, 248, 1)",
              }}
              transition={{ type: "spring", stiffness: 260, damping: 14 }}
            >
              Sign Up
            </motion.button>
          </nav>
        </motion.header>

        {/* Main */}
        <main className="w-full max-w-5xl flex flex-col md:flex-row gap-16">
          <motion.section
            className="flex-1 flex flex-col justify-center space-y-6"
            initial={{ x: -60, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            exit={{ x: -60, opacity: 0 }}
            transition={{ delay: 0.4, duration: 0.7 }}
          >
            <h2 className="text-5xl font-extrabold leading-tight text-slate-300">
              Your <span className="text-sky-400">Fitness Partner</span> for Training, Nutrition & Progress
            </h2>
            <p className="text-gray-300 text-lg max-w-md">
              Beginner-friendly workout plans, nutrition advice, and simple tools to help you stay motivated and reach your goals.
            </p>
            <motion.button
              onClick={() => router.push('/login')}
              className="self-start bg-gradient-to-r from-sky-500 to-sky-600 text-white px-8 py-3 rounded-full font-semibold shadow-lg tracking-wide"
              whileHover={{
                scale: 1.1,
                backgroundColor: "#38bdf8",
                y: -4,
                boxShadow: "0px 8px 20px rgba(56, 189, 248, 1)",
              }}
              whileTap={{
                scale: 0.95,
                boxShadow: "0px 4px 12px rgba(56, 189, 248, 1)",
                rotate: -1,
              }}
              transition={{
                type: "spring",
                stiffness: 300,
                damping: 15,
              }}
            >
              Get Started
            </motion.button>
          </motion.section>

          <motion.section
            className="flex-1 grid gap-8"
            initial={{ x: 60, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            exit={{ x: 60, opacity: 0 }}
            transition={{ delay: 0.6, duration: 0.7 }}
          >
            {features.map(({ Icon, title, description, color }, i) => (
              <motion.div
                key={i}
                className="p-6 rounded-xl shadow-lg bg-gradient-to-br from-gray-900 to-gray-800 hover:scale-105 transition-transform cursor-default flex items-start gap-4"
                initial={{ y: 30, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                exit={{ y: 30, opacity: 0 }}
                transition={{ delay: 0.7 + i * 0.2, duration: 0.5 }}
              >
                <Icon style={{ fontSize: 48, color }} />
                <div>
                  <h3 className="text-xl font-bold">{title}</h3>
                  <p className="text-gray-400">{description}</p>
                </div>
              </motion.div>
            ))}
          </motion.section>
        </main>
      </motion.div>
    </AnimatePresence>
  );
}
