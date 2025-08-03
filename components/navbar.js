import { useState, useEffect } from "react";
import { useSession, signOut } from "next-auth/react";
import { useRouter } from "next/router";
import { motion, AnimatePresence } from "framer-motion";
import {
  Home,
  Dumbbell,
  Apple,
  BookOpen,
  User,
  LogOut,
  UserX,
  Database,
  X,
  Lock,
} from "lucide-react";

// NavButton component for desktop navigation
function NavButton({ router, path, label, rotate, pathname }) {
  const isActive = pathname === path;

  const activeTextColor = "white";
  const inactiveTextColor = "#FFFFFF";
  const hoverTextColor = "#22d3ee"; // Corresponds to cyan-400

  const neonGlow = "0 0 8px #06b6d4, 0 0 12px #06b6d4, 0 0 16px #34d399, 0 0 24px #34d399";
  const subtleHoverGlow = "0px 0px 8px rgba(34, 211, 238, 1)"; // Corresponds to cyan-400 with opacity

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

// MobileNavButton with smooth rolling transition
function MobileNavButton({ onClick, path, label, pathname, icon: Icon }) {
  const isActive = pathname === path;

  return (
    <motion.button
      onClick={onClick}
      className="relative flex-1 flex flex-col items-center justify-center h-full px-2 py-1 z-10"
      whileTap={{ scale: 0.95 }}
      transition={{ type: "spring", stiffness: 500, damping: 25 }}
    >
      {isActive && (
        <motion.div
          layoutId="activeTab"
          className="absolute inset-0 rounded-full bg-gradient-to-r from-cyan-400 to-emerald-400 -z-10 shadow-lg"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ type: "spring", stiffness: 500, damping: 25 }}
        />
      )}
      <motion.div
        className="flex flex-col items-center justify-center p-2 rounded-xl transition-colors duration-200"
        initial={false}
        animate={{
          scale: isActive ? 1.1 : 1,
          color: isActive
            ? "rgb(255, 255, 255)"
            : "rgb(156, 163, 175)",
        }}
        transition={{ type: "spring", stiffness: 500, damping: 25 }}
      >
        <Icon size={24} />
        <span className={`text-xs font-medium mt-1 transition-colors duration-200 ${isActive ? "text-white" : "text-gray-400"}`}>
          {label}
        </span>
      </motion.div>
    </motion.button>
  );
}

// ProfileSidebar component
function ProfileSidebar({ session, isSidebarOpen, onClose, onSignOut, onRemoveAccount, onRemoveData }) {
  const sidebarVariants = {
    open: { x: 0, opacity: 1, transition: { type: "spring", stiffness: 300, damping: 30 } },
    closed: { x: "100%", opacity: 0, transition: { type: "spring", stiffness: 300, damping: 30 } },
  };

  return (
    <AnimatePresence>
      {isSidebarOpen && (
        <motion.div
          className="fixed inset-0 z-50 overflow-hidden"
          initial={{ backgroundColor: "rgba(0,0,0,0)" }}
          animate={{ backgroundColor: "rgba(0,0,0,0.5)" }}
          exit={{ backgroundColor: "rgba(0,0,0,0)" }}
        >
          <motion.aside
            className="fixed top-0 right-0 h-full w-80 bg-gray-900/90 backdrop-blur-2xl shadow-2xl p-6 flex flex-col justify-between"
            variants={sidebarVariants}
            initial="closed"
            animate="open"
            exit="closed"
          >
            {/* Sidebar Content */}
            <div className="flex-grow flex flex-col">
              {/* Close Button */}
              <button onClick={onClose} className="absolute top-4 right-4 text-gray-400 hover:text-white transition-colors">
                <X size={24} />
              </button>

              {/* Profile Header */}
              <div className="flex flex-col items-center mt-8 mb-12">
                <div className="w-24 h-24 rounded-full bg-gradient-to-r from-cyan-400 to-emerald-400 flex items-center justify-center p-1">
                  {session?.user?.image ? (
                    <img src={session.user.image} alt="User" className="w-full h-full rounded-full object-cover" />
                  ) : (
                    <User size={64} className="text-white" />
                  )}
                </div>
                {session?.user?.name && (
                  <h2 className="mt-4 text-xl font-bold text-white tracking-wide">{session.user.name}</h2>
                )}
                {session?.user?.email && (
                  <p className="text-sm text-gray-400 mt-1">{session.user.email}</p>
                )}
              </div>

              {/* Action Buttons */}
              <motion.div className="flex flex-col gap-4" initial="hidden" animate="visible" variants={{ visible: { transition: { staggerChildren: 0.1 } } }}>
                <SidebarButton onClick={onSignOut} icon={<LogOut size={20} />} label="Sign Out" color="bg-gray-800 hover:bg-gray-700" />
                <SidebarButton onClick={onRemoveAccount} icon={<UserX size={20} />} label="Remove Account" color="bg-red-600 hover:bg-red-700" />
                <SidebarButton onClick={onRemoveData} icon={<Database size={20} />} label="Remove All Data" color="bg-yellow-600 hover:bg-yellow-700" />
              </motion.div>
            </div>
          </motion.aside>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

// SidebarButton component with framer-motion
function SidebarButton({ onClick, icon, label, color }) {
  const buttonVariants = {
    hidden: { x: 50, opacity: 0 },
    visible: { x: 0, opacity: 1 },
  };
  return (
    <motion.button
      onClick={onClick}
      className={`flex items-center justify-center gap-3 w-full px-6 py-3 rounded-xl transition-all duration-300 transform font-semibold text-white shadow-lg ${color}`}
      variants={buttonVariants}
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
    >
      {icon}
      <span>{label}</span>
    </motion.button>
  );
}

// Confirmation Modal with Password Input
function ConfirmationModalWithPassword({
  isOpen,
  onClose,
  onConfirm,
  title,
  message,
  confirmText,
  icon: Icon,
  email
}) {
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  if (!isOpen) return null;

  const modalVariants = {
    hidden: { scale: 0.8, opacity: 0 },
    visible: { scale: 1, opacity: 1, transition: { type: "spring", stiffness: 300, damping: 30 } },
    exit: { scale: 0.8, opacity: 0 },
  };

  const handleConfirm = async () => {
    setIsLoading(true);
    setError("");

    try {
      await onConfirm(email, password);
      onClose();
    } catch (err) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <AnimatePresence>
      <motion.div
        className="fixed inset-0 z-[60] flex items-center justify-center bg-black/70 backdrop-blur-sm p-4"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
      >
        <motion.div
          className="bg-gray-800 p-8 rounded-2xl shadow-2xl max-w-sm w-full text-center border border-gray-700"
          variants={modalVariants}
          initial="hidden"
          animate="visible"
          exit="exit"
        >
          <div className="flex justify-center mb-6">
            <div className="p-3 bg-red-600 rounded-full">
              <Icon size={32} className="text-white" />
            </div>
          </div>
          <h3 className="text-2xl font-bold text-white mb-2">{title}</h3>
          <p className="text-gray-400 mb-6">{message}</p>
          <div className="flex flex-col items-center w-full">
            <div className="relative w-full mb-4">
              <Lock size={20} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter your password to confirm"
                className="w-full pl-10 pr-4 py-2 bg-gray-700 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-cyan-400 transition-all duration-200"
              />
            </div>
            {error && (
              <p className="text-red-400 text-sm mb-4">{error}</p>
            )}
            <div className="flex gap-4 justify-center w-full">
              <button
                onClick={onClose}
                className="flex-1 px-6 py-2 rounded-xl bg-gray-700 text-white font-semibold hover:bg-gray-600 transition-colors"
                disabled={isLoading}
              >
                Cancel
              </button>
              <button
                onClick={handleConfirm}
                className={`flex-1 px-6 py-2 rounded-xl text-white font-semibold transition-colors ${isLoading ? "bg-gray-500 cursor-not-allowed" : "bg-red-600 hover:bg-red-700"}`}
                disabled={isLoading || !password}
              >
                {isLoading ? "Confirming..." : confirmText}
              </button>
            </div>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}

// Main Navbar component
export default function Navbar() {
  const router = useRouter();
  const { data: session, status } = useSession();
  const pathname = router.pathname;

  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isAccountModalOpen, setIsAccountModalOpen] = useState(false);
  const [isDataModalOpen, setIsDataModalOpen] = useState(false);

  // Close sidebar on route change
  useEffect(() => {
    const handleRouteChange = () => {
      setIsSidebarOpen(false);
    };
    router.events.on("routeChangeComplete", handleRouteChange);
    return () => {
      router.events.off("routeChangeComplete", handleRouteChange);
    };
  }, [router.events]);

  if (status === "loading") return null;

  // The main navigation links, including the Profile link.
  const navLinks = [
    { path: "/dashboard", label: "Home", rotate: -3.5, icon: Home },
    { path: "/workouts", label: "Workouts", rotate: 3.5, icon: Dumbbell },
    { path: "/diet", label: "Diet", rotate: -3.5, icon: Apple },
    { path: "/tutorials", label: "Tutorials", rotate: 3.5, icon: BookOpen },
    { path: "/profile", label: "Profile", rotate: -3.5, icon: User },
  ];

  const handleSignOut = () => {
    signOut({ callbackUrl: "/" });
  };

  // This function is for removing the account.
  const handleRemoveAccount = async (email, password) => {
    try {
      const res = await fetch('/api/remove-account', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({ email, password }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.message || "Failed to remove account.");
      }

      signOut({ callbackUrl: "/" });
      console.log(data.message);
      return { success: true, message: data.message };

    } catch (error) {
      console.error("Account removal error:", error.message);
      throw new Error(error.message);
    }
  };

  // This function is for removing all user data (but not the account).
  const handleRemoveData = async (email, password) => {
    try {
      const res = await fetch('/api/remove-data', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.message || "Failed to remove data.");
      }

      console.log(data.message);
    } catch (error) {
      throw new Error(error.message);
    }
  };

  return (
    <div className="relative w-full">
      {/* Desktop Top Nav - Visible only on medium and larger screens */}
      <nav className="fixed top-0 left-0 right-0 z-40 backdrop-blur-xl bg-white/10 shadow-2xl px-6 py-3 justify-between items-center hidden sm:flex">
        {/* Logo */}
        <div className="text-lg font-semibold">
          <h1 className="text-3xl font-bold tracking-wide select-none cursor-default text-white">
            <span className="bg-clip-text text-transparent bg-gradient-to-r from-cyan-400 to-emerald-400 drop-shadow-lg">TrackFit</span>
          </h1>
        </div>

        {/* Desktop nav links */}
        <div className="flex items-center gap-6">
          {navLinks.map((link) => (
            <NavButton key={link.path} {...link} pathname={pathname} router={router} />
          ))}
        </div>

        {/* User info & signout trigger - this is kept separate for the desktop view */}
        <motion.div
          className="flex items-center gap-4 cursor-pointer relative"
          onClick={() => setIsSidebarOpen(true)}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
        >
          {session?.user?.image ? (
            <img
              src={session.user.image}
              alt="User"
              className="w-10 h-10 rounded-full object-cover border-2 border-white"
            />
          ) : (
            <div className="w-10 h-10 rounded-full flex items-center justify-center bg-gray-700 border-2 border-white">
              <User size={20} className="text-white" />
            </div>
          )}
          {session?.user?.name && (
            <span className="text-white font-medium text-lg hidden lg:block">{session.user.name}</span>
          )}
        </motion.div>
      </nav>

      {/* Mobile Top Header and Bottom Nav - Visible only on small screens */}
      <div className="sm:hidden">
        {/* Mobile Top Header */}
        <div className="fixed top-0 left-0 right-0 z-40 backdrop-blur-xl bg-white/10 shadow-2xl px-6 py-3 flex justify-center items-center">
          <h1 className="text-3xl font-bold tracking-wide select-none cursor-default text-white">
            <span className="bg-clip-text text-transparent bg-gradient-to-r from-cyan-400 to-emerald-400 drop-shadow-lg">TrackFit</span>
          </h1>
        </div>

        {/* Mobile Bottom Navigation */}
        <nav className="fixed bottom-0 left-0 right-0 z-40 backdrop-blur-xl bg-gray-800/60 shadow-inner shadow-gray-900 border-t border-white/10 p-2">
          <div className="flex justify-around items-center h-16 relative">
            {/* The navigation links for mobile, excluding the Profile link to avoid duplication */}
            {navLinks
              .filter(link => link.path !== "/profile")
              .map((link) => (
                <MobileNavButton
                  key={link.path}
                  {...link}
                  pathname={pathname}
                  onClick={() => router.push(link.path)}
                />
              ))}
            {/* The single, dedicated Profile button for mobile */}
            <MobileNavButton
              key="/profile"
              path="/profile"
              label="Profile"
              icon={User}
              pathname={pathname}
              onClick={() => {
                // If the user is on the profile page, open the sidebar.
                // Otherwise, navigate to the profile page.
                if (pathname === '/profile') {
                  setIsSidebarOpen(true);
                } else {
                  router.push('/profile');
                }
              }}
            />
          </div>
        </nav>
      </div>

      {/* The Profile Sidebar Overlay */}
      <ProfileSidebar
        session={session}
        isSidebarOpen={isSidebarOpen}
        onClose={() => setIsSidebarOpen(false)}
        onSignOut={handleSignOut}
        onRemoveAccount={() => { setIsSidebarOpen(false); setIsAccountModalOpen(true); }}
        onRemoveData={() => { setIsSidebarOpen(false); setIsDataModalOpen(true); }}
      />

      {/* Confirmation Modal for Removing Account */}
      <ConfirmationModalWithPassword
        isOpen={isAccountModalOpen}
        onClose={() => setIsAccountModalOpen(false)}
        onConfirm={handleRemoveAccount}
        title="Remove Account"
        message="Are you sure you want to permanently delete your account? This action cannot be undone."
        confirmText="Yes, Remove Account"
        icon={UserX}
        email={session?.user?.email}
      />

      {/* Confirmation Modal for Removing Data */}
      <ConfirmationModalWithPassword
        isOpen={isDataModalOpen}
        onClose={() => setIsDataModalOpen(false)}
        onConfirm={handleRemoveData}
        title="Remove All Data"
        message="Are you sure you want to delete all your fitness data? This will not delete your account."
        confirmText="Yes, Remove Data"
        icon={Database}
        email={session?.user?.email}
      />
    </div>
  );
}
