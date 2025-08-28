function Bar({ label, value, target }) {
    const pct = Math.max(0, Math.min(100, (value / (target || 1)) * 100));
    let fill = "bg-emerald-500";
    if (pct < 80) fill = "bg-amber-400";
    if (pct > 100) fill = "bg-rose-500";
    const unit = label === "Calories" ? "kcal" : "g";
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
  
  export default function MacroBars({ pCon, cCon, fCon, calCon, pObj, cObj, fObj, calObj }) {
    return (
      <div className="mb-2">
        <Bar label="Protéines" value={pCon} target={pObj} />
        <Bar label="Glucides"  value={cCon} target={cObj} />
        <Bar label="Lipides"   value={fCon} target={fObj} />
        <Bar label="Calories"  value={calCon} target={calObj} />
      </div>
    );
  }
  