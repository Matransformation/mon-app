// components/common/MacroProgressBar.jsx
export default function MacroProgressBar({ label, value, target }) {
    const pct = Math.max(0, Math.min(100, (value / (target || 1)) * 100));
    const unit = label === "Calories" ? "kcal" : "g";
    let fill = "bg-emerald-500";
    if (pct < 80) fill = "bg-amber-400";
    if (pct > 100) fill = "bg-rose-500";
  
    return (
      <div className="mb-2">
        <div className="mb-1 flex items-baseline justify-between text-xs text-gray-600">
          <span className="font-medium">{label}</span>
          <span className="tabular-nums">
            {Math.round(value)} / {Math.round(target)} {unit}
          </span>
        </div>
        <div className="h-2 w-full overflow-hidden rounded bg-gray-200">
          <div className={`${fill} h-full transition-[width] duration-300`} style={{ width: `${pct}%` }} />
        </div>
      </div>
    );
  }
  