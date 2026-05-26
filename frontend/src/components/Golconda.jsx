import { useState, useEffect, useRef, useCallback } from "react";

function rand(a, b) {
  return a + Math.random() * (b - a);
}

function BowlerMan({ size = 40, color = "#1a1a2e", opacity = 1, style }) {
  return (
    <svg
      width={size}
      height={size * 2.2}
      viewBox="0 0 40 88"
      fill="none"
      style={{ ...style, opacity }}
    >
      <ellipse cx="20" cy="14" rx="14" ry="3.5" fill={color} />
      <path d="M10 14 C10 4, 30 4, 30 14" fill={color} />
      <ellipse cx="20" cy="18" rx="7" ry="6" fill={color} />
      <rect x="17" y="23" width="6" height="4" fill={color} />
      <path
        d="M10 27 L12 24 L17 27 L17 26 L23 26 L23 27 L28 24 L30 27 L30 58 C30 60 28 62 26 62 L14 62 C12 62 10 60 10 58 Z"
        fill={color}
      />
      <path d="M10 30 L5 48 L7 48 L12 34" fill={color} />
      <path d="M30 30 L35 48 L33 48 L28 34" fill={color} />
      <path d="M14 62 L13 82 L11 82 L11 84 L17 84 L17 82 L16 82 L17 62" fill={color} />
      <path d="M23 62 L24 82 L22 82 L22 84 L28 84 L28 82 L27 82 L26 62" fill={color} />
    </svg>
  );
}

function createMan(i, total) {
  const cols = 8;
  const rows = Math.ceil(total / cols);
  const col = i % cols;
  const row = Math.floor(i / cols);
  const baseX = (col + 0.5) / cols * 100;
  const baseY = (row + 0.5) / rows * 80 + 5;
  return {
    id: i,
    baseX,
    baseY,
    x: baseX + rand(-3, 3),
    y: baseY + rand(-3, 3),
    size: rand(22, 36),
    depth: rand(0.3, 1),
    phase: rand(0, Math.PI * 2),
    bobSpeed: rand(0.3, 0.8),
    bobAmp: rand(1.5, 4),
    falling: false,
    fallVy: 0,
    fallY: 0,
  };
}

const TOTAL_MEN = 40;

export default function Golconda({ onClose }) {
  const [men, setMen] = useState(() =>
    Array.from({ length: TOTAL_MEN }, (_, i) => createMan(i, TOTAL_MEN))
  );
  const [mouse, setMouse] = useState({ x: 50, y: 50 });
  const [gravityOn, setGravityOn] = useState(false);
  const containerRef = useRef(null);
  const animRef = useRef(null);
  const timeRef = useRef(0);
  const mouseRef = useRef(mouse);
  const gravityRef = useRef(false);

  mouseRef.current = mouse;
  gravityRef.current = gravityOn;

  useEffect(() => {
    const handleKey = (e) => { if (e.key === "Escape") onClose?.(); };
    window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
  }, [onClose]);

  useEffect(() => {
    function loop() {
      timeRef.current += 0.016;
      const t = timeRef.current;
      const m = mouseRef.current;
      const grav = gravityRef.current;

      setMen((prev) =>
        prev.map((man) => {
          const px = (m.x - 50) * 0.01 * man.depth * 12;
          const py = (m.y - 50) * 0.01 * man.depth * 8;
          const bob = Math.sin(t * man.bobSpeed + man.phase) * man.bobAmp;

          if (grav && !man.falling) {
            return { ...man, falling: true, fallVy: 0, fallY: 0 };
          }

          if (man.falling) {
            const newVy = man.fallVy + 0.04;
            const newFallY = man.fallY + newVy;
            if (man.y + newFallY > 120) {
              if (!gravityRef.current) {
                return { ...man, falling: false, fallVy: 0, fallY: 0 };
              }
              return { ...man, fallY: -rand(20, 60), fallVy: 0 };
            }
            return { ...man, fallVy: newVy, fallY: newFallY };
          }

          return { ...man, renderX: man.x + px, renderY: man.y + py + bob };
        })
      );

      animRef.current = requestAnimationFrame(loop);
    }
    animRef.current = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(animRef.current);
  }, []);

  const handleMouseMove = useCallback((e) => {
    const rect = containerRef.current.getBoundingClientRect();
    setMouse({
      x: ((e.clientX - rect.left) / rect.width) * 100,
      y: ((e.clientY - rect.top) / rect.height) * 100,
    });
  }, []);

  const handleTouchMove = useCallback((e) => {
    const rect = containerRef.current.getBoundingClientRect();
    const touch = e.touches[0];
    setMouse({
      x: ((touch.clientX - rect.left) / rect.width) * 100,
      y: ((touch.clientY - rect.top) / rect.height) * 100,
    });
  }, []);

  const toggleGravity = useCallback(() => setGravityOn((p) => !p), []);

  const sorted = [...men].sort((a, b) => a.depth - b.depth);

  return (
    <div
      ref={containerRef}
      onMouseMove={handleMouseMove}
      onTouchMove={handleTouchMove}
      style={{
        position: "fixed",
        inset: 0,
        zIndex: 9999,
        overflow: "hidden",
        cursor: "crosshair",
        userSelect: "none",
      }}
    >
      <link
        href="https://fonts.googleapis.com/css2?family=Playfair+Display:ital@1&family=DM+Mono:wght@300&display=swap"
        rel="stylesheet"
      />

      {/* 하늘 그라데이션 */}
      <div
        style={{
          position: "absolute",
          inset: 0,
          background: "linear-gradient(180deg, #b8cce0 0%, #d6dfe8 35%, #e2ddd4 70%, #cfc4b3 100%)",
          zIndex: 0,
        }}
      />

      {/* 건물 실루엣 */}
      <svg
        style={{ position: "absolute", bottom: 0, left: 0, width: "100%", height: "35%", zIndex: 1 }}
        viewBox="0 0 1000 300"
        preserveAspectRatio="none"
      >
        <rect x="0" y="80" width="80" height="220" fill="#8a7e6e" />
        <rect x="0" y="60" width="80" height="25" fill="#7d7165" />
        {[15, 40, 60].map((wx) => [100, 140, 180, 220].map((wy) => (
          <rect key={`a${wx}-${wy}`} x={wx} y={wy} width="12" height="16" fill="#a89d8d" rx="1" />
        )))}
        <rect x="85" y="50" width="90" height="250" fill="#978a7a" />
        <polygon points="85,50 130,20 175,50" fill="#8a7e6e" />
        {[105, 135, 155].map((wx) => [70, 110, 150, 190, 230].map((wy) => (
          <rect key={`b${wx}-${wy}`} x={wx} y={wy} width="11" height="15" fill="#b0a494" rx="1" />
        )))}
        <rect x="180" y="70" width="85" height="230" fill="#8f8272" />
        {[195, 218, 241].map((wx) => [90, 130, 170, 210, 250].map((wy) => (
          <rect key={`c${wx}-${wy}`} x={wx} y={wy} width="11" height="15" fill="#a49888" rx="1" />
        )))}
        <rect x="270" y="40" width="95" height="260" fill="#9b8e7e" />
        <rect x="270" y="25" width="95" height="20" fill="#8a7e6e" />
        {[288, 315, 340].map((wx) => [60, 100, 140, 180, 220, 260].map((wy) => (
          <rect key={`d${wx}-${wy}`} x={wx} y={wy} width="12" height="16" fill="#b5a999" rx="1" />
        )))}
        <rect x="370" y="65" width="80" height="235" fill="#887b6b" />
        <polygon points="370,65 410,30 450,65" fill="#7d7165" />
        {[385, 410, 430].map((wx) => [85, 125, 165, 205, 245].map((wy) => (
          <rect key={`e${wx}-${wy}`} x={wx} y={wy} width="11" height="15" fill="#9e9282" rx="1" />
        )))}
        <rect x="455" y="55" width="100" height="245" fill="#948778" />
        {[472, 500, 528].map((wx) => [75, 115, 155, 195, 235].map((wy) => (
          <rect key={`f${wx}-${wy}`} x={wx} y={wy} width="12" height="16" fill="#aa9e8e" rx="1" />
        )))}
        <rect x="560" y="45" width="85" height="255" fill="#8f8272" />
        <rect x="560" y="30" width="85" height="20" fill="#827567" />
        {[575, 600, 623].map((wx) => [60, 100, 140, 180, 220, 260].map((wy) => (
          <rect key={`g${wx}-${wy}`} x={wx} y={wy} width="11" height="15" fill="#a49888" rx="1" />
        )))}
        <rect x="650" y="70" width="90" height="230" fill="#978a7a" />
        <polygon points="650,70 695,35 740,70" fill="#8a7e6e" />
        {[668, 695, 718].map((wx) => [90, 130, 170, 210, 250].map((wy) => (
          <rect key={`h${wx}-${wy}`} x={wx} y={wy} width="11" height="15" fill="#b0a494" rx="1" />
        )))}
        <rect x="745" y="50" width="80" height="250" fill="#8a7e6e" />
        {[760, 785, 808].map((wx) => [70, 110, 150, 190, 230].map((wy) => (
          <rect key={`i${wx}-${wy}`} x={wx} y={wy} width="11" height="15" fill="#9e9282" rx="1" />
        )))}
        <rect x="830" y="60" width="90" height="240" fill="#948778" />
        <rect x="830" y="42" width="90" height="22" fill="#877a6c" />
        {[848, 875, 898].map((wx) => [80, 120, 160, 200, 240].map((wy) => (
          <rect key={`j${wx}-${wy}`} x={wx} y={wy} width="12" height="16" fill="#aa9e8e" rx="1" />
        )))}
        <rect x="925" y="55" width="80" height="245" fill="#8f8272" />
        {[940, 965].map((wx) => [75, 115, 155, 195, 235].map((wy) => (
          <rect key={`k${wx}-${wy}`} x={wx} y={wy} width="11" height="15" fill="#a49888" rx="1" />
        )))}
      </svg>

      {/* 인물들 */}
      {sorted.map((man) => {
        const x = man.falling ? man.x : man.renderX || man.x;
        const y = man.falling ? man.y + man.fallY : man.renderY || man.y;
        const scale = 0.6 + man.depth * 0.5;
        const op = 0.4 + man.depth * 0.55;
        const darkness = Math.round(20 + (1 - man.depth) * 25);
        const color = `rgb(${darkness}, ${darkness}, ${Math.round(darkness * 1.3)})`;
        return (
          <div
            key={man.id}
            style={{
              position: "absolute",
              left: `${x}%`,
              top: `${y}%`,
              transform: `translate(-50%, -50%) scale(${scale})`,
              zIndex: Math.round(man.depth * 10) + 2,
              pointerEvents: "none",
            }}
          >
            <BowlerMan size={man.size} color={color} opacity={op} />
          </div>
        );
      })}

      {/* 타이틀 */}
      <div style={{ position: "absolute", top: 24, left: 28, zIndex: 30, pointerEvents: "none" }}>
        <div style={{
          fontFamily: "'Playfair Display', serif",
          fontStyle: "italic",
          fontSize: "28px",
          color: "rgba(40,35,30,0.5)",
          letterSpacing: "1px",
        }}>
          Golconda
        </div>
        <div style={{
          fontFamily: "'DM Mono', monospace",
          fontSize: "11px",
          color: "rgba(40,35,30,0.3)",
          marginTop: "4px",
          fontWeight: 300,
        }}>
          homage to Magritte, 1953
        </div>
      </div>

      {/* 닫기 버튼 */}
      <button
        onClick={onClose}
        style={{
          position: "absolute",
          top: 20,
          right: 24,
          zIndex: 30,
          background: "rgba(40,35,30,0.12)",
          border: "1px solid rgba(40,35,30,0.2)",
          borderRadius: "8px",
          width: 32,
          height: 32,
          cursor: "pointer",
          fontSize: "15px",
          color: "rgba(40,35,30,0.5)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
        title="닫기 (ESC)"
      >
        ✕
      </button>

      {/* 중력 토글 */}
      <button
        onClick={toggleGravity}
        style={{
          position: "absolute",
          bottom: 24,
          right: 28,
          zIndex: 30,
          background: gravityOn ? "rgba(40,35,30,0.35)" : "rgba(40,35,30,0.15)",
          border: "1px solid rgba(40,35,30,0.2)",
          borderRadius: "20px",
          padding: "8px 18px",
          color: "rgba(40,35,30,0.6)",
          fontFamily: "'DM Mono', monospace",
          fontSize: "12px",
          fontWeight: 300,
          cursor: "pointer",
          backdropFilter: "blur(4px)",
          transition: "all 0.3s ease",
        }}
      >
        {gravityOn ? "↓ gravity on" : "○ float"}
      </button>

      {/* 힌트 */}
      <div style={{
        position: "absolute",
        bottom: 28,
        left: "50%",
        transform: "translateX(-50%)",
        fontFamily: "'DM Mono', monospace",
        fontSize: "11px",
        color: "rgba(40,35,30,0.25)",
        fontWeight: 300,
        pointerEvents: "none",
        whiteSpace: "nowrap",
        zIndex: 30,
      }}>
        마우스를 움직여보세요
      </div>
    </div>
  );
}
