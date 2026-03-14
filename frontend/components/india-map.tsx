export function IndiaMap() {
  return (
    <div className="relative border border-[#E2D4B0] bg-haldi p-6">
      <div className="absolute right-6 top-6 border border-neela bg-neela px-3 py-2 text-sm font-semibold text-haath">
        3 pilot constituencies active
      </div>
      <svg viewBox="0 0 620 640" className="mx-auto w-full max-w-[430px]" aria-label="India map placeholder">
        <path
          d="M312 34l52 36 61 8 26 45-6 42 49 58-18 63-30 35 25 50-19 47-49 39-21 66-71 105-28-17-40 22-33-23 17-52-27-41-53-27-17-57-52-61 15-50 44-31 21-46-14-57 28-48 49-26 31-57 61-12z"
          fill="none"
          stroke="rgba(27,42,74,0.2)"
          strokeWidth="4"
        />
        <rect x="270" y="150" width="84" height="46" fill="rgba(255,153,51,0.25)" />
        <rect x="260" y="206" width="96" height="40" fill="rgba(200,89,42,0.28)" />
        <rect x="278" y="262" width="74" height="36" fill="rgba(45,106,79,0.24)" />
        <circle cx="336" cy="108" r="10" fill="#FF9933" />
        <circle cx="336" cy="108" r="30" fill="none" stroke="rgba(255,153,51,0.32)" strokeWidth="4" />
        <circle cx="328" cy="348" r="10" fill="#2D6A4F" />
        <circle cx="328" cy="348" r="36" fill="none" stroke="rgba(45,106,79,0.32)" strokeWidth="4" />
      </svg>
    </div>
  );
}

