import { useEffect, useRef } from "react";

const PETAL_PATHS = [
  "M0,-8 C-20,-60 -55,-75 -15,-90 C10,-95 25,-65 8,-35 C5,-20 2,-12 0,-8Z",
  "M8,0 C60,-20 75,-55 90,-15 C95,10 65,25 35,8 C20,5 12,2 8,0Z",
  "M0,8 C20,60 55,75 15,90 C-10,95 -25,65 -8,35 C-5,20 -2,12 0,8Z",
  "M-8,0 C-60,20 -75,55 -90,15 C-95,-10 -65,-25 -35,-8 C-20,-5 -12,-2 -8,0Z",
];

export default function Pinwheel() {
  const svgRef = useRef(null);
  const bladesRef = useRef(null);
  const angleRef = useRef(0);
  const speedRef = useRef(0.4);
  const targetSpeedRef = useRef(0.4);
  const animRef = useRef(null);
  const centerRef = useRef({ x: 0, y: 0 });

  useEffect(() => {
    const svg = svgRef.current;
    if (!svg) return;

    function updateCenter() {
      const rect = svg.getBoundingClientRect();
      centerRef.current = {
        x: rect.left + rect.width / 2,
        y: rect.top + rect.height / 2,
      };
    }
    updateCenter();
    window.addEventListener("resize", updateCenter);
    window.addEventListener("scroll", updateCenter, { passive: true });

    function onMouseMove(e) {
      const { x: cx, y: cy } = centerRef.current;
      const dx = e.clientX - cx;
      const dy = e.clientY - cy;
      const dist = Math.sqrt(dx * dx + dy * dy);
      const t = Math.max(0, 1 - dist / 320);
      targetSpeedRef.current = 0.3 + t * t * t * 24.7;
    }
    window.addEventListener("mousemove", onMouseMove);

    function loop() {
      speedRef.current += (targetSpeedRef.current - speedRef.current) * 0.04;
      angleRef.current = (angleRef.current + speedRef.current) % 360;

      const el = bladesRef.current;
      if (el) {
        el.style.transform = `rotate(${angleRef.current}deg)`;
        const blur = Math.min(speedRef.current * 0.13, 2.5);
        el.style.filter = blur > 0.4 ? `blur(${blur}px)` : "none";
      }

      animRef.current = requestAnimationFrame(loop);
    }
    animRef.current = requestAnimationFrame(loop);

    return () => {
      cancelAnimationFrame(animRef.current);
      window.removeEventListener("resize", updateCenter);
      window.removeEventListener("scroll", updateCenter);
      window.removeEventListener("mousemove", onMouseMove);
    };
  }, []);

  return (
    /*
     * SVG 레이아웃 박스는 날개 영역만(58×58).
     * overflow: visible 로 막대가 헤더 아래로 자연스럽게 내려옴.
     */
    <svg
      ref={svgRef}
      width="58"
      height="58"
      viewBox="-110 -110 220 220"
      style={{ overflow: "visible", flexShrink: 0, display: "block" }}
      aria-hidden="true"
    >
      {/* 막대 — SVG 박스 밖으로 흘러내림 */}
      <line
        x1="0" y1="4" x2="0" y2="115"
        stroke="rgba(255,255,255,0.6)"
        strokeWidth="2.5"
        strokeLinecap="round"
      />
      {/* 날개 */}
      <g ref={bladesRef} style={{ transformOrigin: "0px 0px" }}>
        {PETAL_PATHS.map((d, i) => (
          <path
            key={i}
            d={d}
            fill="none"
            stroke="rgba(255,255,255,0.92)"
            strokeWidth="2.4"
            strokeLinejoin="round"
            strokeLinecap="round"
          />
        ))}
      </g>
      {/* 중심 핀 */}
      <circle cx="0" cy="0" r="4.5" fill="rgba(255,255,255,0.85)" />
    </svg>
  );
}
