import { useSession, signOut } from "next-auth/react";
import { useRouter } from "next/router";
import { useEffect } from "react";
import { motion } from "framer-motion";// ✅ Ensure default export is used

export default function Dashboard() {
  const router = useRouter();
  const { data: session, status } = useSession();


  if (status === "loading") return <p className="text-white p-4">Loading...</p>;
  if (!session) {
    router.replace("/"); // redirect if not authenticated
    return null;
  }

  return (
    <div className="relative w-full">
      <motion.div
        className="flex flex-col items-center justify-center text-white px-4 py-12"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -20 }}
      >
        <h1 className="text-4xl font-bold mb-6">Welcome to Your Workouts</h1>
        <p className="text-lg mb-8">Track your fitness journey and progress here.</p>
        <button
          onClick={() => signOut({ callbackUrl: "/" })}
          className="bg-red-500 hover:bg-red-600 text-white font-semibold py-2 px-4 rounded"
        >
          Sign Out
        </button>
      </motion.div>
    </div>
  );
}
