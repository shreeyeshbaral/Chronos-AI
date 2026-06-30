function AnimatedBackground() {
  return (
    <>
      <div className="fixed inset-0 -z-10 overflow-hidden bg-slate-950">

        <div className="absolute w-[700px] h-[700px] bg-blue-500/20 rounded-full blur-3xl animate-blob top-[-200px] left-[-200px]" />

        <div className="absolute w-[600px] h-[600px] bg-cyan-500/20 rounded-full blur-3xl animate-blob animation-delay-4000 bottom-[-200px] right-[-150px]" />

        <div className="absolute w-[500px] h-[500px] bg-indigo-500/20 rounded-full blur-3xl animate-blob animation-delay-2000 top-[40%] left-[40%]" />

      </div>
    </>
  );
}

export default AnimatedBackground;