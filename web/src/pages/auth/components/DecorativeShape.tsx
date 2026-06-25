export function DecorativeShape() {
  return (
    <div className="absolute top-0 right-0 h-screen w-full md:w-[50%] overflow-hidden pointer-events-none z-0">
      {/* Container to position the shape so it bleeds off the right and top edges */}
      <div className="absolute top-[-40px] right-[-60px] w-[500px] h-[520px] opacity-10 md:opacity-100 hidden md:block">
        <svg
          viewBox="0 0 500 520"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          className="w-full h-full"
        >
          {/* Main Dark Forest Shape - Abstract "P" / Arc with notch */}
          <path
            fillRule="evenodd"
            clipRule="evenodd"
            d="M500 0H200C89.543 0 0 89.543 0 200C0 310.457 89.543 400 200 400H280L150 520V520H200L330 400H350C432.843 400 500 332.843 500 250V0ZM350 200C350 161.34 318.66 130 280 130C241.34 130 210 161.34 210 200C210 238.66 241.34 270 280 270H350V200Z"
            fill="#062F28"
          />
          {/* Accent Lime Green Shape (40% opacity) */}
          <path
            d="M350 200C350 238.66 318.66 270 280 270C241.34 270 210 238.66 210 200C210 161.34 241.34 130 280 130H350V200Z"
            fill="#9FE870"
            fillOpacity="0.4"
          />
          {/* Angular accent notch */}
          <path d="M450 450L350 550V520L420 450H450Z" fill="#9FE870" fillOpacity="0.4" />
        </svg>
      </div>
    </div>
  );
}
