export default function HeroSection() {
  return (
    <div className="relative min-h-screen bg-gradient-to-br from-[#2c004f] to-[#440088] overflow-hidden text-white">
      {/* Grid overlay */}
      <div className="absolute inset-0 bg-[radial-gradient(#ffffff10_1px,transparent_1px)] bg-[size:40px_40px] z-0" />

      {/* Glow circle (right corner) */}
      <div className="absolute right-0 top-0 w-[300px] h-[300px] bg-[#9246ff] rounded-full opacity-20 blur-3xl z-0" />

      {/* Content */}
      <div className="relative z-10 flex flex-col items-center justify-center h-full text-center px-4">
        <h1 className="text-5xl md:text-7xl font-extrabold">
          Organize Your Life <br />
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-pink-400 via-purple-400 to-cyan-400">
            Get Things Done
          </span>
        </h1>
        <p className="mt-6 text-lg text-gray-200 max-w-xl">
          The ultimate todo app that transforms chaos into clarity...
        </p>
        <button className="mt-6 px-6 py-3 bg-gradient-to-r from-purple-500 to-pink-500 text-white font-semibold rounded-full shadow-lg">
          Get Started Free →
        </button>
      </div>
    </div>
  );
}
