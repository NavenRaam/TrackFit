export default function TipCard({ text }) {
  return (
    <div className="bg-purple-800 hover:bg-purple-700 transition-all p-3 rounded-lg shadow-md">
      {text}
    </div>
  );
}
