export function IndicatorArt({ kind, compact = false }) {
  return (
    <div
      className={`flex flex-col overflow-hidden bg-muted/35 ${compact ? "h-32" : "h-44"}`}
    >
      {kind === "high52" && (
        <div aria-hidden="true" className="flex h-6 shrink-0 items-center gap-3 pl-3">
          <span className="whitespace-nowrap text-[10px] font-medium text-muted-foreground">
            52 WEEKS HIGH
          </span>
          <span className="min-w-0 flex-1 border-t border-dashed border-blue-500/60" />
        </div>
      )}
      <svg
        viewBox="0 0 500 180"
        preserveAspectRatio="none"
        className="min-h-0 w-full flex-1"
        aria-hidden="true"
      >
        <defs>
          <pattern
            id={`grid-${kind}-${compact}`}
            width="50"
            height="36"
            patternUnits="userSpaceOnUse"
          >
            <path
              d="M 50 0 L 0 0 0 36"
              fill="none"
              stroke="currentColor"
              strokeOpacity=".07"
            />
          </pattern>
        </defs>
        <rect width="500" height="180" fill={`url(#grid-${kind}-${compact})`} />
        {kind === "mcdx" ? (
          Array.from({ length: 40 }, (_, i) => {
            const h = 25 + (Math.sin(i * 0.4) + 1) * 35;
            return (
              <g key={i}>
                <rect
                  x={i * 12.5 + 3}
                  y={160 - h}
                  width="7"
                  height={h}
                  fill="#10b981"
                  opacity=".8"
                />
                <rect
                  x={i * 12.5 + 3}
                  y={130 - h}
                  width="7"
                  height="26"
                  fill="#f59e0b"
                  opacity=".7"
                />
                <rect
                  x={i * 12.5 + 3}
                  y="20"
                  width="7"
                  height={Math.max(8, 106 - h)}
                  fill="#f43f5e"
                  opacity=".5"
                />
              </g>
            );
          })
        ) : (
          <>
            <path
              d="M0 145 L15 135 25 146 40 121 55 127 70 105 85 116 100 96 115 107 130 91 150 111 165 94 180 101 195 82 210 95 225 70 240 80 255 67 270 83 290 66 305 75 320 51 335 63 350 45 365 58 380 39 395 54 410 32 425 42 440 27 455 34 470 18 485 26 500 14"
              fill="none"
              stroke="#3b82f6"
              strokeWidth="2.5"
              strokeLinejoin="round"
            />
            {kind !== "high52" && (
              <g fill="none" strokeWidth="2">
                <path
                  d="M0 151 Q90 111 180 105 T360 66 T500 40"
                  stroke="#8b5cf6"
                />
                <path d="M0 161 Q130 134 230 119 T500 67" stroke="#f59e0b" />
                <path d="M0 173 Q180 150 270 137 T500 98" stroke="#10b981" />
                <path d="M0 178 Q240 165 500 129" stroke="#94a3b8" />
              </g>
            )}
          </>
        )}
      </svg>
      <span className="flex h-6 shrink-0 items-center justify-end px-3 text-[10px] uppercase tracking-wider text-muted-foreground">
        Illustration
      </span>
    </div>
  );
}
