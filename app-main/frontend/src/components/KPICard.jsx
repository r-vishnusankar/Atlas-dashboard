import React, { useEffect, useState } from "react";

function useCountUp(target, duration = 700) {
  const [val, setVal] = useState(0);
  useEffect(() => {
    let raf;
    const start = performance.now();
    const from = 0;
    const step = (t) => {
      const elapsed = t - start;
      const pct = Math.min(1, elapsed / duration);
      const eased = 1 - Math.pow(1 - pct, 3);
      setVal(Math.round(from + (target - from) * eased));
      if (pct < 1) raf = requestAnimationFrame(step);
    };
    raf = requestAnimationFrame(step);
    return () => cancelAnimationFrame(raf);
  }, [target, duration]);
  return val;
}

export default function KPICard({ label, value, accent = "var(--stresk-primary)", trend, icon: Icon, testId }) {
  const animated = useCountUp(value);
  return (
    <div className="stresk-card kpi-card" data-testid={testId}>
      <span className="accent" style={{ background: accent }} />
      <div className="label" style={{ display: "flex", alignItems: "center", gap: 8 }}>
        {Icon ? <Icon size={14} color={accent} /> : null}
        {label}
      </div>
      <div className="value">{animated}</div>
      {trend ? <div className="trend">{trend}</div> : null}
    </div>
  );
}
