export default function PageLayout({ children, bgImage }) {
  return (
    <div className="relative min-h-screen w-full bg-[#f8f8f6]">
      {/* Background with mix-blend-multiply so white parts dissolve into the base tone */}
      <div
        className="fixed top-0 left-0 w-screen h-screen z-0 bg-cover bg-center bg-no-repeat mix-blend-multiply pointer-events-none"
        style={{ backgroundImage: `url('${bgImage}')` }}
      />

      {/* Content overlay above the fixed background */}
      <div className="relative z-10 flex flex-col w-full min-h-screen">
        {children}
      </div>
    </div>
  );
}
