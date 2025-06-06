import { useSession } from "next-auth/react";
import { useRouter } from "next/router";
import { useEffect, useState } from "react";
import { motion } from "framer-motion";

export default function Dashboard() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (status === "authenticated") {
      const checkProfile = async () => {
        const res = await fetch(`/api/profile?email=${session.user.email}`);
        const data = await res.json();
        if (!data?.age || !data?.fitnessGoal) {
          router.replace("/profile"); // redirect to profile if incomplete
        } else {
          setLoading(false); // show dashboard
        }
      };
      checkProfile();
    }
  }, [session, status, router]);

  if (status === "loading" || loading)
    return <p className="text-white p-4">Loading...</p>;

  return (
    <div className="relative w-full">
      <motion.div
        className="flex flex-col items-center justify-center text-white px-4 py-12"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -20 }}
      >
        <h1 className="text-4xl font-bold mb-6">Welcome to Your Dashboard</h1>
        <p className="text-lg mb-8">Track your fitness journey and progress here.</p>
      </motion.div>
    </div>
  );
}
