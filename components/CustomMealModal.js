// components/CustomMealModal.js
import { motion, AnimatePresence } from 'framer-motion';
import { useState } from 'react';

// Framer Motion variants for the modal backdrop
const backdropVariants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1 },
};

// Framer Motion variants for the modal content
const modalVariants = {
  hidden: { y: "-100vh", opacity: 0 },
  visible: { y: "0", opacity: 1, transition: { delay: 0.1, type: "spring", stiffness: 100 } },
  exit: { y: "100vh", opacity: 0 },
};

export default function CustomMealModal({ onClose, onSubmit }) {
  const [dish, setDish] = useState('');
  const [calories, setCalories] = useState('');
  const [protein, setProtein] = useState('');
  const [carbs, setCarbs] = useState('');
  const [fats, setFats] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    setError(''); // Clear previous errors

    // Basic validation
    if (!dish.trim()) {
      setError('Meal name is required.');
      return;
    }
    if (isNaN(parseInt(calories)) || parseInt(calories) <= 0) {
      setError('Calories must be a positive number.');
      return;
    }
    if (isNaN(parseInt(protein)) || parseInt(protein) < 0 || isNaN(parseInt(carbs)) || parseInt(carbs) < 0 || isNaN(parseInt(fats)) || parseInt(fats) < 0) {
      setError('Macros must be non-negative numbers.');
      return;
    }

    onSubmit({
      dish: dish.trim(),
      calories: parseInt(calories),
      macros: {
        protein: parseInt(protein),
        carbs: parseInt(carbs),
        fats: parseInt(fats),
      },
      // You can add more fields if needed, like ingredients, preparation for custom meals
      ingredients: [], // Placeholder for now
      preparation: '', // Placeholder for now
    });
  };

  return (
    <AnimatePresence>
      {/* Backdrop */}
      <motion.div
        className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50 p-4"
        variants={backdropVariants}
        initial="hidden"
        animate="visible"
        exit="hidden"
        onClick={onClose} // Close modal when clicking on backdrop
      >
        {/* Modal Content */}
        <motion.div
          className="bg-gray-800 rounded-xl shadow-2xl p-6 w-full max-w-md border border-gray-700 relative"
          variants={modalVariants}
          onClick={(e) => e.stopPropagation()} // Prevent closing when clicking inside modal
        >
          <button
            onClick={onClose}
            className="absolute top-3 right-3 text-gray-400 hover:text-white text-2xl font-bold transition-colors"
          >
            &times;
          </button>
          <h2 className="text-3xl font-bold text-teal-400 mb-6 text-center">Log Your Own Meal</h2>

          {error && (
            <div className="bg-red-900/30 border border-red-700 text-red-300 p-3 rounded-md mb-4 text-sm">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label htmlFor="dish" className="block text-white text-lg font-semibold mb-2">Meal Name</label>
              <input
                type="text"
                id="dish"
                value={dish}
                onChange={(e) => setDish(e.target.value)}
                className="w-full p-3 bg-gray-700 text-white rounded-md border border-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="e.g., Dosa with Sambar"
                required
              />
            </div>

            <div>
              <label htmlFor="calories" className="block text-white text-lg font-semibold mb-2">Calories (kcal)</label>
              <input
                type="number"
                id="calories"
                value={calories}
                onChange={(e) => setCalories(e.target.value)}
                className="w-full p-3 bg-gray-700 text-white rounded-md border border-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="e.g., 450"
                min="1"
                required
              />
            </div>

            <div className="grid grid-cols-3 gap-4">
              <div>
                <label htmlFor="protein" className="block text-white text-lg font-semibold mb-2">Protein (g)</label>
                <input
                  type="number"
                  id="protein"
                  value={protein}
                  onChange={(e) => setProtein(e.target.value)}
                  className="w-full p-3 bg-gray-700 text-white rounded-md border border-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="e.g., 20"
                  min="0"
                  required
                />
              </div>
              <div>
                <label htmlFor="carbs" className="block text-white text-lg font-semibold mb-2">Carbs (g)</label>
                <input
                  type="number"
                  id="carbs"
                  value={carbs}
                  onChange={(e) => setCarbs(e.target.value)}
                  className="w-full p-3 bg-gray-700 text-white rounded-md border border-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="e.g., 50"
                  min="0"
                  required
                />
              </div>
              <div>
                <label htmlFor="fats" className="block text-white text-lg font-semibold mb-2">Fats (g)</label>
                <input
                  type="number"
                  id="fats"
                  value={fats}
                  onChange={(e) => setFats(e.target.value)}
                  className="w-full p-3 bg-gray-700 text-white rounded-md border border-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="e.g., 15"
                  min="0"
                  required
                />
              </div>
            </div>

            <button
              type="submit"
              className="w-full py-3 bg-green-600 hover:bg-green-700 text-white font-bold rounded-md text-lg shadow-md transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-opacity-75"
            >
              Add Meal
            </button>
          </form>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}