import "@/styles/globals.css";
import { SessionProvider } from "next-auth/react";
import { useRouter } from "next/router";
import { AnimatePresence, motion } from "framer-motion";
import Navbar from "@/components/navbar"; // Adjust the import path as necessary

export default function App({ Component, pageProps: { session, ...pageProps } }) {
  const router = useRouter();

  // Define routes where Navbar should be hidden
  const hideNavbarRoutes = ["/", "/login", "/signup"];

  const shouldShowNavbar = !hideNavbarRoutes.includes(router.pathname);

  return (
    <SessionProvider session={session} secret={process.env.NEXTAUTH_SECRET}>
      <div className="relative min-h-screen bg-gray-950 text-white flex flex-col items-center">
        {shouldShowNavbar && <Navbar />}
        <AnimatePresence mode="wait">
          <motion.div
            key={router.route}
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.4 }}
            className={shouldShowNavbar ? "pt-32 px-4" : "px-4"}
          >
            <Component {...pageProps} />
          </motion.div>
        </AnimatePresence>
      </div>
    </SessionProvider>
  );
}