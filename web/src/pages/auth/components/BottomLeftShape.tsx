export function BottomLeftShape() {
  return (
    <div className="absolute bottom-0 left-0 w-[300px] h-[300px] pointer-events-none z-0 hidden md:block">
      <svg
        viewBox="0 0 300 300"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="absolute bottom-[-20px] left-[-20px] w-full h-full"
      >
        {/* Abstract curve detail for balance */}
        <path d="M0 300V150C82.843 150 150 217.157 150 300H0Z" fill="#062F28" />
        <path
          d="M150 300C150 217.157 217.157 150 300 150V300H150Z"
          fill="#9FE870"
          fillOpacity="0.4"
        />
        <path
          d="M0 150V100C110.457 100 200 189.543 200 300H150C150 217.157 82.843 150 0 150Z"
          fill="#9FE870"
          fillOpacity="0.4"
        />
      </svg>
    </div>
  );
}
