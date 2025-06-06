import { useState, useEffect } from "react";
import { signIn, useSession } from "next-auth/react";
import { useRouter } from "next/router";
import { motion, AnimatePresence } from "framer-motion";

export default function Login() {
  const { data: session, status } = useSession();
  const router = useRouter();

  const [form, setForm] = useState({ username: "", email: "", password: "" });
  const [isSigningUp, setIsSigningUp] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (router.query.signup === "true") {
      setIsSigningUp(true);
    } else {
      setIsSigningUp(false);
    }
  }, [router.query.signup]);

  useEffect(() => {
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
      {/* Use router.asPath as key so motion div remounts on route changes */}
      <motion.div
        key={router.asPath}
        className="relative min-h-screen flex items-center justify-center px-6 py-40"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.5 }}
      >
        <motion.div
          className="backdrop-blur-xl bg-gradient-to-br from-white/10 to-white/5 border border-white/20 rounded-2xl shadow-2xl w-full max-w-md p-8 text-white mt-[-40px]"
          initial={{ y: 50, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: 50, opacity: 0 }}
          transition={{ type: "spring", stiffness: 90, damping: 18 }}
          whileHover={{ scale: 1.03 }}
        >
          <motion.h1
            className="text-3xl font-extrabold mb-6 text-center"
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2, duration: 0.6 }}
          >
            {isSigningUp ? "Create Account" : "Welcome Back"}
          </motion.h1>

          <motion.form
            onSubmit={handleSubmit}
            className="space-y-5"
            initial="hidden"
            animate="visible"
            variants={{
              hidden: {},
              visible: { transition: { staggerChildren: 0.15 } },
            }}
          >
            {isSigningUp && (
              <motion.input
                type="text"
                name="username"
                placeholder="Username"
                className="w-full px-4 py-3 rounded bg-gray-800/70 text-white focus:outline-none focus:ring-2 focus:ring-pink-400"
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
              className="w-full px-4 py-3 rounded bg-gray-800/70 text-white focus:outline-none focus:ring-2 focus:ring-pink-400"
              value={form.email}
              onChange={handleChange}
              required
              variants={inputVariants}
            />

            <motion.input
              type="password"
              name="password"
              placeholder="Password"
              className="w-full px-4 py-3 rounded bg-gray-800/70 text-white focus:outline-none focus:ring-2 focus:ring-pink-400"
              value={form.password}
              onChange={handleChange}
              required
              variants={inputVariants}
            />

            {error && (
              <motion.p
                className="text-red-500 text-sm mt-1"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.5 }}
              >
                {error}
              </motion.p>
            )}

            <motion.button
              type="submit"
              className="w-full bg-gradient-to-r from-sky-500 via-purple-500 to-sky-600 text-white font-semibold py-3 rounded shadow-lg tracking-wide"
              whileHover={{
                scale: 1.05,
                y: -3,
                boxShadow: "0 4px 15px rgba(56, 189, 248, 1)",
              }}
              whileTap={{ scale: 0.95 }}
              transition={{ type: "spring", stiffness: 260, damping: 18 }}
              variants={inputVariants}
            >
              {isSigningUp ? "Sign Up" : "Login"}
            </motion.button>
          </motion.form>

          <motion.div
            className="my-5 text-sm text-center"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.7 }}
          >
            {isSigningUp ? "Already have an account?" : "New here?"}
            <button
              className="ml-2 text-purple-500 hover:underline"
              onClick={() => setIsSigningUp(!isSigningUp) && router.push("/login")}
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
            <button
              onClick={() => signIn("google")}
              className="w-full bg-white/90 text-black font-bold py-3 rounded hover:bg-white transition"
            >
              Sign in with Google
            </button>
          </motion.div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
