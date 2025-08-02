import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useRouter } from 'next/router';
import { FaDumbbell } from 'react-icons/fa';
import { HeartPulse, UtensilsCrossed, BarChartBig } from 'lucide-react';

const features = [
  {
    Icon: HeartPulse,
    title: 'Custom Workouts',
    description: 'Step-by-step training plans tailored for newbies.',
    color: 'from-blue-600 to-indigo-700',
  },
  {
    Icon: UtensilsCrossed,
    title: 'Smart Nutrition',
    description: 'Simple meal guides designed to power your gains.',
    color: 'from-teal-500 to-cyan-600',
  },
  {
    Icon: BarChartBig,
    title: 'Progress Insights',
    description: 'Clear visual stats to track your fitness journey.',
    color: 'from-amber-400 to-orange-500',
  },
];

const testimonials = [
  {
    quote: "TrackFit made getting started with my fitness journey so easy. The workout plans are simple and effective!",
    author: "Alex J.",
  },
  {
    quote: "The nutrition guides are a game-changer. I've learned so much about fueling my body without feeling overwhelmed.",
    author: "Maria S.",
  },
  {
    quote: "I love seeing my progress in the app. It's a huge motivator and keeps me on track with my goals.",
    author: "Benjamin C.",
  },
];

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.2,
    },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0 },
};

const Home = () => {
  const router = useRouter();
  const [testiIndex, setTestiIndex] = useState(0);
  const [coords, setCoords] = useState({ x: -100, y: -100 });
  const [showDumbbell, setShowDumbbell] = useState(false);

  useEffect(() => {
    const timer = setInterval(() => {
      setTestiIndex((prev) => (prev + 1) % testimonials.length);
    }, 5000);
    return () => clearInterval(timer);
  }, []);

  const handleClick = (e) => {
    setCoords({ x: e.clientX, y: e.clientY });
    setShowDumbbell(true);
    setTimeout(() => setShowDumbbell(false), 800);
  };

  return (
    <AnimatePresence mode="wait">
      <motion.div
        key="home-landing"
        className="relative min-h-screen text-white flex flex-col items-center pt-24 pb-12 px-4 bg-gray-950"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.8 }}
        onClick={handleClick}
      >
        {/* Animated Dumbbell on click */}
        <AnimatePresence>
          {showDumbbell && (
            <motion.div
              className="absolute pointer-events-none"
              style={{
                top: coords.y,
                left: coords.x,
                x: '-50%',
                y: '-50%',
              }}
              initial={{ scale: 0, opacity: 1, rotate: -90 }}
              // FIXED: Changed the animate prop to a single state to work with spring transition.
              // The fade-out effect is handled by the exit prop below.
              animate={{ scale: 1, opacity: 1, rotate: 0 }} 
              exit={{ scale: 2, opacity: 0, transition: { duration: 0.5 } }}
              transition={{ duration: 0.5, type: "spring", stiffness: 300, damping: 10 }}
            >
              <FaDumbbell size={50} className="text-cyan-400 drop-shadow-lg" />
            </motion.div>
          )}
        </AnimatePresence>

        {/* Header */}
        <motion.header
          className="w-full max-w-7xl flex justify-between items-center fixed top-0 left-1/2 -translate-x-1/2 p-6 z-50 backdrop-blur-sm bg-gray-950/70 rounded-b-xl"
          initial={{ y: -100, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.6 }}
        >
          <h1 className="text-4xl font-extrabold tracking-wide select-none cursor-default">
            <span className="bg-clip-text text-transparent bg-gradient-to-r from-cyan-400 to-emerald-400 drop-shadow-lg">TrackFit</span>
          </h1>
          <nav className="space-x-6 flex items-center">
            <motion.button
              onClick={() => router.push('/login')}
              className="text-gray-300 font-semibold tracking-wide hover:text-white transition-colors"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              Login
            </motion.button>
            <motion.button
              onClick={() => router.push('/login?signup=true')}
              className="px-6 py-2 rounded-full font-bold shadow-lg tracking-wide bg-gradient-to-r from-cyan-600 to-emerald-600 hover:from-cyan-700 hover:to-emerald-700 transition-all duration-300 transform hover:scale-105"
              whileHover={{
              boxShadow: "0 10px 40px 0 rgba(6, 182, 212, 0.5)",
              }}
              whileTap={{ scale: 0.95, boxShadow: "0 10px 40px 0 rgba(6, 182, 212, 0.5)" }}
              transition={{ type: "spring", stiffness: 260, damping: 20 }}
            >
              Sign Up
            </motion.button>
          </nav>
        </motion.header>

        {/* Main Content */}
        <motion.main
          className="w-full max-w-7xl flex flex-col items-center text-center mt-12 mb-20"
          variants={containerVariants}
          initial="hidden"
          animate="visible"
        >
          <motion.div
            className="w-full max-w-4xl"
            variants={itemVariants}
          >
            <h2 className="text-6xl md:text-7xl lg:text-8xl font-extrabold leading-tight tracking-tighter text-gray-200">
              Your{" "}
              <span className="bg-clip-text text-transparent bg-gradient-to-r from-cyan-400 to-emerald-400 drop-shadow-lg">
                Fitness Partner
              </span>
            </h2>
            <h3 className="text-2xl md:text-3xl lg:text-4xl font-bold mt-4 text-gray-200">
              Training, Nutrition & Progress.
            </h3>
            <p className="mt-8 text-gray-400 text-lg md:text-xl max-w-3xl mx-auto">
              Unlock your potential with beginner-friendly workout plans, smart nutrition advice, and simple tools to track your journey and stay motivated.
            </p>
          </motion.div>

          <motion.button
            onClick={() => router.push('/login?signup=true')}
            className="mt-12 px-10 py-4 rounded-full font-bold shadow-2xl tracking-wide text-lg text-white transform transition-all duration-300 ease-in-out
                       bg-gradient-to-r from-cyan-600 to-emerald-600 hover:from-cyan-700 hover:to-emerald-700 hover:scale-105"
            whileHover={{
              boxShadow: "0 10px 40px 0 rgba(6, 182, 212, 0.5)",
            }}
            whileTap={{ scale: 0.95, boxShadow: "0 10px 40px 0 rgba(6, 182, 212, 0.5)" }}
            variants={itemVariants}
          >
            Get Started
          </motion.button>
        </motion.main>

        {/* Features Section */}
        <motion.section
          className="w-full max-w-7xl mt-16 grid grid-cols-1 md:grid-cols-3 gap-8"
          variants={containerVariants}
          initial="hidden"
          animate="visible"
        >
          {features.map(({ Icon, title, description, color }, i) => (
            <motion.div
              key={i}
              className="p-8 rounded-3xl shadow-xl border border-gray-800 bg-gray-900 flex flex-col items-center text-center transition-all duration-300
                         hover:scale-105 hover:shadow-2xl cursor-default group"
              variants={itemVariants}
              transition={{ delay: 0.2 * i, duration: 0.6 }}
            >
              <div className={`p-4 rounded-full mb-4 inline-block bg-gradient-to-br ${color} transition-all duration-300 group-hover:scale-110`}>
                <Icon size={48} className="text-white" />
              </div>
              <h3 className="text-2xl font-bold text-gray-100">{title}</h3>
              <p className="text-gray-400 mt-2">{description}</p>
            </motion.div>
          ))}
        </motion.section>

        {/* Testimonials Section */}
        <motion.section
          className="w-full max-w-4xl mt-24 text-center"
          variants={containerVariants}
          initial="hidden"
          animate="visible"
        >
          <motion.h2 className="text-4xl font-extrabold mb-8 text-gray-200" variants={itemVariants}>
            What Our Users Say
          </motion.h2>
          <motion.div
            className="p-8 rounded-3xl shadow-xl border border-gray-800 bg-gray-900 relative"
            variants={itemVariants}
          >
            <AnimatePresence mode="wait">
              <motion.p
                key={testiIndex}
                className="text-xl md:text-2xl italic text-gray-300"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.5 }}
              >
                "{testimonials[testiIndex].quote}"
              </motion.p>
            </AnimatePresence>
            <p className="mt-4 text-lg font-semibold text-gray-400">
              - {testimonials[testiIndex].author}
            </p>
          </motion.div>
        </motion.section>
      </motion.div>
    </AnimatePresence>
  );
};

export default Home;
