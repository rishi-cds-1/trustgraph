"use client";

type AgentCursorProps = {
  name: string;
  color: string;
  x: number;
  y: number;
  pulse?: boolean;
};

export function AgentCursor({ name, color, x, y, pulse }: AgentCursorProps) {
  return (
    <div
      className="pointer-events-none absolute z-20 flex items-center transition-[left,top] duration-700 ease-out"
      style={{ left: x, top: y }}
    >
      {pulse && (
        <span
          className="absolute -left-1 -top-1 h-4 w-4 animate-ping rounded-full opacity-60"
          style={{ backgroundColor: color }}
        />
      )}
      <svg
        width="16"
        height="16"
        viewBox="0 0 18 18"
        fill="none"
        style={{ filter: "drop-shadow(0 1px 2px rgba(0,0,0,0.25))" }}
      >
        <path
          d="M1 1L1 14.5L4.5 11.5L6.8 16.5L9 15.5L6.7 10.5L11.5 10.3L1 1Z"
          fill={color}
          stroke="white"
          strokeWidth="1"
        />
      </svg>
      <span
        className="ml-1.5 inline-block whitespace-nowrap rounded-full px-2 py-0.5 text-[10px] font-medium text-white shadow-sm"
        style={{ backgroundColor: color }}
      >
        {name}
      </span>
    </div>
  );
}
