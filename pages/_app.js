import "@/styles/globals.css";
import { SessionProvider } from "next-auth/react";
import { useRouter } from "next/router";
import { AnimatePresence, motion } from "framer-motion";
import Navbar from "@/components/navbar";
import { useEffect, useState } from "react";

export default function App({ Component, pageProps: { session, ...pageProps } }) {
  const router = useRouter();
  const [isMobile, setIsMobile] = useState(false);

  // Define routes where Navbar should be hidden
  const hideNavbarRoutes = ["/", "/login", "/signup"];
  const shouldShowNavbar = !hideNavbarRoutes.includes(router.pathname);

  // This useEffect hook runs on the client-side to detect the screen size.
  useEffect(() => {
    const handleResize = () => {
      // Tailwind's 'sm' breakpoint is 640px.
      setIsMobile(window.innerWidth < 640);
    };

    // Set initial state
    handleResize();

    // Add event listener for window resize
    window.addEventListener("resize", handleResize);

    // Clean up the event listener on component unmount
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  // Determine the correct padding class based on screen size
  const mainContentPadding = isMobile ? "pt-24 pb-24" : "pt-24";

  return (
    <SessionProvider session={session} secret={process.env.NEXTAUTH_SECRET}>
      {/* We apply padding here to the main wrapper to account for fixed navbars */}
      <div className={`relative min-h-screen bg-gray-950 text-white flex flex-col items-center ${shouldShowNavbar ? mainContentPadding : 'pt-0 pb-0'}`}>
        {shouldShowNavbar && <Navbar />}
        <AnimatePresence mode="wait">
          <motion.div
            key={router.route}
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.4 }}
            className="w-full flex-grow flex flex-col items-center justify-center"
          >
            <Component {...pageProps} />
          </motion.div>
        </AnimatePresence>
      </div>
    </SessionProvider>
  );
}