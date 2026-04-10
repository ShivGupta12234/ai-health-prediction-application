import { useEffect, useRef, useState } from "react";
import { useInView } from "framer-motion";

const AnimatedCounter = ({ end, duration = 2, suffix = "", prefix = "", className = "" }) => {
  const [count, setCount] = useState(0);
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-100px" });
  const hasAnimated = useRef(false);

  useEffect(() => {
    if (!isInView || hasAnimated.current) return;
    hasAnimated.current = true;

    const endNum = typeof end === "string" ? parseFloat(end) : end;
    if (isNaN(endNum)) {
      setCount(end);
      return;
    }

    const startTime = Date.now();
    const durationMs = duration * 1000;

    const animate = () => {
      const elapsed = Date.now() - startTime;
      const progress = Math.min(elapsed / durationMs, 1);

      // Ease out cubic
      const eased = 1 - Math.pow(1 - progress, 3);
      const current = Math.round(eased * endNum);

      setCount(current);

      if (progress < 1) {
        requestAnimationFrame(animate);
      }
    };

    requestAnimationFrame(animate);
  }, [isInView, end, duration]);

  return (
    <span ref={ref} className={className}>
      {prefix}{typeof end === "string" && isNaN(parseFloat(end)) ? end : count}{suffix}
    </span>
  );
};

export default AnimatedCounter;
