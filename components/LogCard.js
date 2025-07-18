export default function LogCard({ email, onClose }) {
  return (
    <div
      onClick={(e) => e.stopPropagation()}
      className="bg-white text-black rounded-xl shadow-2xl p-6 w-[90%] max-w-md transform transition hover:scale-105"
    >
      <h2 className="text-xl font-bold mb-4">Log Today’s Progress</h2>
      {/* form inputs */}
      <button
        className="mt-4 bg-purple-600 text-white px-4 py-2 rounded hover:bg-purple-700"
        onClick={onClose}
      >
        Close
      </button>
    </div>
  );
}
