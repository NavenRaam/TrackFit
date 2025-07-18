import { useSession, signOut } from "next-auth/react";
import { useRouter } from "next/router";
import { motion, AnimatePresence } from "framer-motion";
import { useState } from "react";
import { HiOutlineMenu, HiOutlineX } from "react-icons/hi";

export default function Navbar() {
  const router = useRouter();
  const { data: session, status } = useSession();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const pathname = router.pathname;

  if (status === "loading") return null;

  const navLinks = [
    { path: "/dashboard", label: "Home", rotate: -3.5 },
    { path: "/workouts", label: "Workouts", rotate: 3.5 },
    { path: "/diet", label: "Diet", rotate: -3.5 },
    { path: "/tutorials", label: "Tutorials", rotate: 3.5 },
    { path: "/profile", label: "Profile", rotate: -3.5 },
  ];

  return (
    <div className="relative w-full">
      <nav className="fixed top-0 left-0 right-0 z-40 backdrop-blur-xl bg-white/10 shadow-2xl px-6 py-3 flex justify-between items-center">
        {/* Logo */}
        <div className="text-lg font-semibold">
          <h1 className="text-3xl font-bold tracking-wide select-none cursor-default text-white">
            <span className="text-purple-500">Track</span>
            <span className="text-sky-600">Fit</span>
          </h1>
        </div>

        {/* Desktop nav */}
        <div className="hidden sm:flex items-center gap-6">
          {navLinks.map((link) => (
            <NavButton key={link.path} {...link} pathname={pathname} router={router} />
          ))}
        </div>

        {/* User info & signout */}
        <div className="hidden sm:flex items-center gap-4">
          {session?.user?.name && (
            <span className="text-white">{session.user.name}</span>
          )}
          <button
            onClick={() => signOut({ callbackUrl: "/" })}
            className="bg-red-500 text-white px-4 py-1.5 rounded hover:bg-red-600"
          >
            Sign Out
          </button>
        </div>

        {/* Hamburger menu */}
        <button className="sm:hidden text-white text-3xl" onClick={() => setSidebarOpen(true)}>
          <HiOutlineMenu />
        </button>
      </nav>

      {/* Sidebar for mobile */}
      <AnimatePresence>
        {sidebarOpen && (
          <motion.aside
            initial={{ x: "100%" }}
            animate={{ x: 0 }}
            exit={{ x: "100%" }}
            transition={{ type: "tween", duration: 0.3 }}
            className="fixed top-0 right-0 h-screen w-64 bg-gray-900 shadow-lg z-50 flex flex-col p-6 gap-6"
          >
            <div className="flex justify-between items-center">
              <h2 className="text-2xl font-bold text-white">Menu</h2>
              <button
                className="text-white text-3xl"
                onClick={() => setSidebarOpen(false)}
              >
                <HiOutlineX />
              </button>
            </div>
            <div className="flex flex-col gap-4 mt-4">
              {navLinks.map((link) => (
                <button
                  key={link.path}
                  onClick={() => {
                    router.push(link.path);
                    setSidebarOpen(false);
                  }}
                  className={`text-lg text-left font-semibold text-white px-2 py-2 rounded hover:bg-gray-800 ${
                    pathname === link.path ? "bg-sky-700" : ""
                  }`}
                >
                  {link.label}
                </button>
              ))}
              <button
                onClick={() => {
                  signOut({ callbackUrl: "/" });
                  setSidebarOpen(false);
                }}
                className="bg-red-500 text-white px-4 py-2 rounded mt-6 hover:bg-red-600"
              >
                Sign Out
              </button>
            </div>
          </motion.aside>
        )}
      </AnimatePresence>
    </div>
  );
}

function NavButton({ router, path, label, rotate, pathname }) {
  const isActive = pathname === path;

  // Define colors for consistency
  const activeTextColor = "white"; // sky-500
  const inactiveTextColor = "#FFFFFF"; // white
  const hoverTextColor = "#38BDF8"; // sky-400

  // Define the specific glow effects
  const neonGlow = "0 0 8px #0ea5e9, 0 0 12px #0ea5e9, 0 0 16px #38bdf8, 0 0 24px #38bdf8";
  const subtleHoverGlow = "0px 0px 8px rgba(56, 189, 248, 1)"; // Ensure this is not too strong

  return (
    <motion.button
      onClick={() => router.push(path)}
      className="font-semibold tracking-wide relative" // Remove padding/rounded here, it's about text now
      initial={{
        color: inactiveTextColor,
        textShadow: "none",
      }}
      animate={
        isActive
          ? {
              color: activeTextColor,
              textShadow: neonGlow, // Apply neon glow only when active
            }
          : {
              color: inactiveTextColor,
              textShadow: "none", // No glow when inactive
            }
      }
      whileHover={{
        scale: 1.1,
        rotate: rotate,
        color: hoverTextColor,
        textShadow: subtleHoverGlow, // Apply subtle glow on hover for any button
      }}
      whileTap={{ scale: 0.95 }}
      transition={{ type: "spring", stiffness: 500, damping: 25 }} // Keep the spring transition
    >
      {label}
    </motion.button>
  );
}