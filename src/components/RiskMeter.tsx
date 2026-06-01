import React, { useEffect, useState } from "react";

interface RiskMeterProps {
  percentage: number;
  level: string;
}

export const RiskMeter: React.FC<RiskMeterProps> = ({ percentage, level }) => {
  const [displayPercentage, setDisplayPercentage] = useState(0);

  useEffect(() => {
    // Smooth ease-out counter tick and rotation sweep animation
    const duration = 1200; // 1.2 seconds total animation length
    const start = 0;
    const end = percentage;
    const fps = 60;
    const totalFrames = (duration / 1000) * fps;
    let frame = 0;

    const timer = setInterval(() => {
      frame++;
      const progress = frame / totalFrames;
      // Ease out cubic function for organic look
      const easeProgress = 1 - Math.pow(1 - progress, 3);
      const current = Math.round(start + easeProgress * (end - start));
      
      setDisplayPercentage(current);

      if (frame >= totalFrames) {
        setDisplayPercentage(end);
        clearInterval(timer);
      }
    }, 1000 / fps);

    return () => clearInterval(timer);
  }, [percentage]);

  const angle = -90 + (displayPercentage / 100) * 180;

  return (
    <div id="risk-meter-root" className="flex flex-col items-center justify-center p-2">
      <div className="relative w-56 h-36 flex items-end justify-center">
        {/* Graded Arc SVG Dial */}
        <svg viewBox="0 0 100 65" className="w-full h-full overflow-visible">
          <defs>
            <linearGradient id="gauge-gradient" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#10b981" /> {/* Emerald for LOW */}
              <stop offset="50%" stopColor="#f59e0b" /> {/* Amber for MODERATE */}
              <stop offset="100%" stopColor="#ef4444" /> {/* Red for HIGH */}
            </linearGradient>
            <filter id="needle-glow" x="-20%" y="-20%" width="140%" height="140%">
              <feDropShadow dx="0" dy="1" stdDeviation="1.2" floodColor="#22d3ee" floodOpacity="0.7" />
            </filter>
            <filter id="arc-glow" x="-10%" y="-10%" width="120%" height="120%">
              <feDropShadow dx="0" dy="2" stdDeviation="1" floodColor="#06b6d4" floodOpacity="0.25" />
            </filter>
          </defs>
          
          {/* Background Track Arc */}
          <path
            d="M 12 50 A 38 38 0 0 1 88 50"
            fill="none"
            stroke="rgba(255,255,255,0.06)"
            strokeWidth="8"
            strokeLinecap="round"
          />

          {/* Graded Active Arc with subtle glow */}
          <path
            d="M 12 50 A 38 38 0 0 1 88 50"
            fill="none"
            stroke="url(#gauge-gradient)"
            strokeWidth="8"
            strokeLinecap="round"
            opacity="0.9"
            filter="url(#arc-glow)"
          />

          {/* Indicator ticks */}
          <circle cx="12" cy="50" r="1.5" fill="#10b981" />
          <circle cx="50" cy="12" r="1.5" fill="#f59e0b" />
          <circle cx="88" cy="50" r="1.5" fill="#ef4444" />

          {/* Core Needle Pin */}
          <circle cx="50" cy="50" r="6" fill="#0f172a" stroke="#22d3ee" strokeWidth="1.5" />
          <circle cx="50" cy="50" r="2.5" fill="#22d3ee" />

          {/* Rotatable Pointer Needle */}
          <g transform={`rotate(${angle} 50 50)`} className="transition-transform duration-75">
            <line
              x1="50"
              y1="50"
              x2="50"
              y2="18"
              stroke="#22d3ee"
              strokeWidth="2"
              strokeLinecap="round"
              filter="url(#needle-glow)"
            />
            {/* Needle arrow head tip */}
            <polygon points="50,15 48.5,19 51.5,19" fill="#22d3ee" />
          </g>
          
          {/* Mini Range Identifiers */}
          <text x="12" y="58" fontSize="3.5" fill="#64748b" fontFamily="monospace" textAnchor="middle" fontWeight="bold">LOW</text>
          <text x="50" y="7" fontSize="3.5" fill="#64748b" fontFamily="monospace" textAnchor="middle" fontWeight="bold">MOD</text>
          <text x="88" y="58" fontSize="3.5" fill="#64748b" fontFamily="monospace" textAnchor="middle" fontWeight="bold">HIGH</text>
        </svg>

        {/* Dynamic Display over the SVG */}
        <div className="absolute bottom-1 text-center flex flex-col justify-center items-center">
          <span className="text-3xl font-black tracking-tight text-white drop-shadow-md leading-none">
            {displayPercentage}%
          </span>
          <span
            className={`text-[9px] font-mono tracking-widest uppercase font-black mt-2 px-2.5 py-0.5 rounded-full border bg-black/40 ${
              level === "HIGH"
                ? "text-red-400 border-red-500/20"
                : level === "MODERATE"
                ? "text-amber-400 border-amber-500/20"
                : "text-emerald-400 border-emerald-500/20"
            }`}
          >
            {level} Risk
          </span>
        </div>
      </div>
    </div>
  );
};
