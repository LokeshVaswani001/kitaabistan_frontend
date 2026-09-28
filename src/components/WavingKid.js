export default function WavingKid({ className = "" }) {
  return (
    <svg
      viewBox="0 0 120 140"
      className={className}
      data-testid="welcome-kid"
      aria-hidden="true"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      {/* floor shadow — shrinks when the kid hops */}
      <ellipse className="kid-shadow" cx="60" cy="135" rx="30" ry="4.5" fill="#000000" opacity="0.16" />

      <g className="kid-body">
        {/* legs + shoes */}
        <rect x="48" y="98" width="10" height="28" rx="5" fill="#3B4C55" />
        <rect x="62" y="98" width="10" height="28" rx="5" fill="#3B4C55" />
        <rect x="43" y="122" width="18" height="9" rx="4.5" fill="#22303A" />
        <rect x="59" y="122" width="18" height="9" rx="4.5" fill="#22303A" />

        {/* left arm, hanging */}
        <path
          d="M45 82 C 40 90, 37 98, 37 105"
          stroke="#F3C6A2"
          strokeWidth="9"
          strokeLinecap="round"
        />

        {/* waving arm + hand (behind the torso so the shoulder tucks in) */}
        <g className="kid-arm">
          <path
            d="M76 80 C 86 74, 94 64, 97 53"
            stroke="#F3C6A2"
            strokeWidth="9"
            strokeLinecap="round"
          />
          <circle cx="99" cy="49" r="7.5" fill="#F3C6A2" />
        </g>

        {/* torso */}
        <path
          d="M42 74 Q42 68 48 68 H72 Q78 68 78 74 V100 Q78 106 72 106 H48 Q42 106 42 100 Z"
          fill="var(--brand)"
        />
        <path
          d="M53 68 Q60 75 67 68"
          stroke="var(--brand-deep)"
          strokeWidth="3"
          fill="none"
          strokeLinecap="round"
          opacity="0.7"
        />

        {/* neck */}
        <rect x="55" y="56" width="10" height="16" rx="4" fill="#E9B489" />

        {/* head — nods side to side */}
        <g className="kid-head">
          <circle cx="60" cy="40" r="25" fill="#F3C6A2" />
          <circle cx="36" cy="43" r="4.5" fill="#F3C6A2" />
          <circle cx="84" cy="43" r="4.5" fill="#F3C6A2" />

          <path
            d="M36 36 C 37 16, 50 11, 60 11 C 71 11, 84 17, 84 36 C 79 26, 72 23, 60 23 C 48 23, 41 27, 36 36 Z"
            fill="#33241A"
          />
          <path d="M56 12 C 58 4, 66 5, 67 12 C 63 8, 59 8, 56 12 Z" fill="#33241A" />

          <g className="kid-eyes">
            <circle cx="51" cy="42" r="3.5" fill="#17241F" />
            <circle cx="69" cy="42" r="3.5" fill="#17241F" />
            <circle cx="52.4" cy="40.6" r="1.2" fill="#ffffff" />
            <circle cx="70.4" cy="40.6" r="1.2" fill="#ffffff" />
          </g>

          <path
            d="M46 34.5 Q51 31.5 56 34"
            stroke="#33241A"
            strokeWidth="2.4"
            strokeLinecap="round"
            fill="none"
          />
          <path
            d="M64 34 Q69 31.5 74 34.5"
            stroke="#33241A"
            strokeWidth="2.4"
            strokeLinecap="round"
            fill="none"
          />

          <path
            d="M52 52 Q60 60 68 52"
            stroke="#17241F"
            strokeWidth="2.6"
            strokeLinecap="round"
            fill="none"
          />
          <circle cx="43" cy="49" r="4" fill="#F0837A" opacity="0.45" />
          <circle cx="77" cy="49" r="4" fill="#F0837A" opacity="0.45" />
        </g>

        {/* motion lines by the waving hand */}
        <g className="kid-zap">
          <path
            d="M106 38 Q110 35 114 36"
            stroke="var(--brand)"
            strokeWidth="2.4"
            strokeLinecap="round"
            fill="none"
          />
          <path
            d="M108 46 Q113 45 116 47"
            stroke="var(--brand)"
            strokeWidth="2.4"
            strokeLinecap="round"
            fill="none"
          />
        </g>
      </g>
    </svg>
  );
}
