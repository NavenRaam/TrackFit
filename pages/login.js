import { useState, useEffect } from "react";
import { signIn, useSession } from "next-auth/react";
import { useRouter } from "next/router";
import { motion, AnimatePresence } from "framer-motion";
import { FaGoogle, FaArrowLeft } from "react-icons/fa"; // Import FaArrowLeft icon

export default function Login() {
  const { data: session, status } = useSession();
  const router = useRouter();

  const [form, setForm] = useState({ username: "", email: "", password: "" });
  const [isSigningUp, setIsSigningUp] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    // Check for the 'signup' query parameter to determine the initial form state
    setIsSigningUp(router.query.signup === "true");
  }, [router.query.signup]);

  useEffect(() => {
    // If the user is authenticated, redirect them to the dashboard
    if (status === "authenticated") router.push("/dashboard");
  }, [status, router]);

  const handleChange = (e) =>
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    if (isSigningUp) {
      const res = await fetch("/api/signup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      if (!res.ok) {
        const data = await res.json();
        setError(data.message || "Signup failed");
        return;
      }
    }

    const result = await signIn("credentials", {
      redirect: false,
      email: form.email,
      password: form.password,
    });

    if (result?.error) setError("Invalid credentials");
    else router.replace("/dashboard");
  };

  useEffect(() => {
    document.body.classList.add("overflow-hidden");
    return () => {
      document.body.classList.remove("overflow-hidden");
    };
  }, []);

  const inputVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0 },
  };

  return (
    <AnimatePresence mode="wait" initial={false}>
      <motion.div
        key={router.asPath}
        className="relative min-h-screen flex items-center justify-center px-6 py-40"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.5 }}
      >
        {/* The glossy card with a more "popy" hover effect */}
        <motion.div
          className="backdrop-blur-xl bg-gradient-to-br from-white/10 to-white/5 border border-white/20 rounded-2xl shadow-2xl w-full max-w-md p-8 text-white"
          initial={{ y: 50, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: 50, opacity: 0 }}
          transition={{ type: "spring", stiffness: 90, damping: 18 }}
          whileHover={{ 
            scale: 1.05,
            y: -10,
            // A custom box-shadow to create a vibrant glow on hover
            boxShadow: "0 10px 40px 0 rgba(6, 182, 212, 0.5)",
            transition: { type: "spring", stiffness: 200, damping: 20 }
          }}
        >
          <div className="relative mb-6">
            <motion.h1
              className="text-4xl font-extrabold text-center bg-clip-text text-transparent bg-gradient-to-r from-cyan-400 to-emerald-400 drop-shadow-lg"
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2, duration: 0.6 }}
            >
              {isSigningUp ? "Create Account" : "Welcome Back"}
            </motion.h1>
          </div>

          <AnimatePresence mode="wait">
            <motion.form
              key={isSigningUp ? "signup-form" : "login-form"}
              onSubmit={handleSubmit}
              className="space-y-5"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.3 }}
              // Stagger the children animations
              variants={{
                visible: { transition: { staggerChildren: 0.15 } },
              }}
            >
              {isSigningUp && (
                <motion.input
                  key="username-input"
                  type="text"
                  name="username"
                  placeholder="Username"
                  className="w-full px-4 py-3 rounded bg-white/10 border border-white/20 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-400 transition-all"
                  value={form.username}
                  onChange={handleChange}
                  required
                  variants={inputVariants}
                />
              )}
              <motion.input
                type="email"
                name="email"
                placeholder="Email"
                className="w-full px-4 py-3 rounded bg-white/10 border border-white/20 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-400 transition-all"
                value={form.email}
                onChange={handleChange}
                required
                variants={inputVariants}
              />

              <motion.input
                type="password"
                name="password"
                placeholder="Password"
                className="w-full px-4 py-3 rounded bg-white/10 border border-white/20 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-400 transition-all"
                value={form.password}
                onChange={handleChange}
                required
                variants={inputVariants}
              />

              {error && (
                <motion.p
                  className="text-red-400 text-sm mt-1"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.5 }}
                >
                  {error}
                </motion.p>
              )}

              {/* Main CTA button with a unified gradient */}
              <motion.button
                type="submit"
                className="w-full bg-gradient-to-r from-cyan-600 to-emerald-600 hover:from-cyan-700 hover:to-emerald-700 text-white font-semibold py-3 rounded-lg shadow-lg tracking-wide transform transition-all duration-300 ease-in-out"
                whileHover={{
                  scale: 1.05,
                  y: -3,
                  boxShadow: "0 10px 40px 0 rgba(6, 182, 212, 0.5)",
                }}
                whileTap={{ scale: 0.95 }}
                transition={{ type: "spring", stiffness: 260, damping: 18 }}
                variants={inputVariants}
              >
                {isSigningUp ? "Sign Up" : "Login"}
              </motion.button>
            </motion.form>
          </AnimatePresence>

          <motion.div
            className="my-5 text-sm text-center"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.7 }}
          >
            {isSigningUp ? "Already have an account?" : "New here?"}
            <button
              className="ml-2 text-purple-500 hover:underline font-bold transition-colors"
              onClick={() => {
                setIsSigningUp(!isSigningUp);
                router.push(isSigningUp ? "/login" : "/login?signup=true", undefined, { shallow: true });
              }}
            >
              {isSigningUp ? "Login" : "Sign up"}
            </button>
          </motion.div>

          <motion.div
            className="mt-6"
            initial={{ y: 30, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.8 }}
          >
            {/* Google sign-in button with a glossy look */}
            <button
              onClick={() => signIn("google")}
              className="w-full bg-white/10 text-white font-semibold py-3 rounded-lg border border-white/20 transition-all flex items-center justify-center space-x-2 hover:bg-white/20"
            >
              <FaGoogle className="text-xl" />
              <span>Sign in with Google</span>
            </button>
          </motion.div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
