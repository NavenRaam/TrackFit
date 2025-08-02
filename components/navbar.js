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

  // Animation variants for sidebar items
  const itemVariants = {
    hidden: { opacity: 0, x: 50 },
    visible: { opacity: 1, x: 0, transition: { type: "spring", stiffness: 300, damping: 24 } },
    exit: { opacity: 0, x: 50, transition: { duration: 0.2 } },
  };

  return (
    <div className="relative w-full">
      <nav className="fixed top-0 left-0 right-0 z-40 backdrop-blur-xl bg-white/10 shadow-2xl px-6 py-3 flex justify-between items-center">
        {/* Logo */}
        <div className="text-lg font-semibold">
          <h1 className="text-3xl font-bold tracking-wide select-none cursor-default text-white">
            <span className="bg-clip-text text-transparent bg-gradient-to-r from-cyan-400 to-emerald-400 drop-shadow-lg">TrackFit</span>
          </h1>
        </div>

        {/* Desktop nav */}
        <div className="hidden sm:flex items-center gap-6">
          {navLinks.map((link) => (
            <NavButton key={link.path} {...link} pathname={pathname} router={router} />
          ))}
        </div>

        {/* User info & signout (Desktop) */}
        <div className="hidden sm:flex items-center gap-4">
          {session?.user?.name && (
            <span className="text-white font-medium text-lg">{session.user.name}</span>
          )}
          <button
            onClick={() => signOut({ callbackUrl: "/" })}
            className="bg-red-600 text-white px-4 py-1.5 rounded-lg hover:bg-red-700 transition-colors duration-200 text-base font-medium shadow-md"
          >
            Sign Out
          </button>
        </div>

        {/* Hamburger menu (Mobile) */}
        <button className="sm:hidden text-white text-3xl p-2 rounded-lg hover:bg-white/10 transition-colors" onClick={() => setSidebarOpen(true)}>
          <HiOutlineMenu />
        </button>
      </nav>

      {/* Sidebar for mobile */}
      <AnimatePresence>
        {sidebarOpen && (
          // Overlay background
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-40 bg-black/70 backdrop-blur-sm sm:hidden"
            onClick={() => setSidebarOpen(false)} // Close sidebar when clicking outside
          />
        )}

        {sidebarOpen && (
          <motion.aside
            initial={{ x: "100%" }}
            animate={{ x: 0 }}
            exit={{ x: "100%" }}
            transition={{ type: "tween", duration: 0.4, ease: "easeOut" }} // Slightly longer and smoother transition
            className="fixed top-0 right-0 h-screen w-64 bg-gray-950 shadow-2xl z-50 flex flex-col p-6 gap-6 border-l border-white/10" // Darker background, subtle border
          >
            <div className="flex justify-between items-center pb-4 border-b border-white/10">
              {/* Sidebar Logo */}
              <h1 className="text-3xl font-bold tracking-wide select-none cursor-default">
                <span className="text-purple-500">Track</span>
                <span className="text-sky-600">Fit</span>
              </h1>
              <button
                className="text-white text-3xl p-1 rounded-full hover:bg-white/10 transition-colors"
                onClick={() => setSidebarOpen(false)}
              >
                <HiOutlineX />
              </button>
            </div>

            {/* User Info in Sidebar */}
            {session?.user?.name && (
              <motion.div
                initial="hidden"
                animate="visible"
                exit="exit"
                variants={itemVariants}
                className="text-white text-xl font-semibold mb-4 border-b border-white/10 pb-4"
              >
                Welcome, {session.user.name}!
              </motion.div>
            )}

            {/* Navigation Links */}
            <motion.div
              className="flex flex-col gap-3 flex-grow" // Flex-grow to push sign out to bottom
              initial="hidden"
              animate="visible"
              transition={{ staggerChildren: 0.07, delayChildren: 0.1 }}
            >
              {navLinks.map((link, index) => (
                <motion.button
                  key={link.path}
                  variants={itemVariants}
                  onClick={() => {
                    router.push(link.path);
                    setSidebarOpen(false);
                  }}
                  className={`relative text-left font-semibold text-white px-4 py-3 rounded-lg transition-all duration-200 ease-in-out group
                    ${pathname === link.path ? "bg-gradient-to-r from-sky-700 to-purple-800 shadow-lg text-white" : "hover:bg-white/5"}
                  `}
                >
                  {/* Subtle active indicator */}
                  {pathname === link.path && (
                    <motion.div
                      layoutId="sidebar-active-indicator" // For smooth layout transitions
                      className="absolute inset-y-1 left-0 w-1.5 bg-sky-400 rounded-full"
                    />
                  )}
                  <span className={`relative z-10 ${pathname === link.path ? "ml-2" : ""}`}>
                    {link.label}
                  </span>
                </motion.button>
              ))}
            </motion.div>

            {/* Sign Out Button */}
            <motion.button
              variants={itemVariants}
              onClick={() => {
                signOut({ callbackUrl: "/" });
                setSidebarOpen(false);
              }}
              className="w-full bg-red-600 text-white px-4 py-3 rounded-lg mt-auto hover:bg-red-700 transition-colors duration-200 font-medium shadow-md"
            >
              Sign Out
            </motion.button>
          </motion.aside>
        )}
      </AnimatePresence>
    </div>
  );
}

// NavButton component remains largely unchanged for desktop
function NavButton({ router, path, label, rotate, pathname }) {
  const isActive = pathname === path;

  const activeTextColor = "white";
  const inactiveTextColor = "#FFFFFF";
  const hoverTextColor = "#38BDF8";

  const neonGlow = "0 0 8px #0ea5e9, 0 0 12px #0ea5e9, 0 0 16px #38bdf8, 0 0 24px #38bdf8";
  const subtleHoverGlow = "0px 0px 8px rgba(56, 189, 248, 1)";

  return (
    <motion.button
      onClick={() => router.push(path)}
      className="font-semibold tracking-wide relative"
      initial={{
        color: inactiveTextColor,
        textShadow: "none",
      }}
      animate={
        isActive
          ? {
              color: activeTextColor,
              textShadow: neonGlow,
            }
          : {
              color: inactiveTextColor,
              textShadow: "none",
            }
      }
      whileHover={{
        scale: 1.1,
        rotate: rotate,
        color: hoverTextColor,
        textShadow: subtleHoverGlow,
      }}
      whileTap={{ scale: 0.95 }}
      transition={{ type: "spring", stiffness: 500, damping: 25 }}
    >
      {label}
    </motion.button>
  );
}