import { useState, useEffect, useRef, useCallback } from "react";

const DECOMPOSE_MAP = {
  "비": ["ㅂ", "ㅣ"],
};

function rand(a, b) { return a + Math.random() * (b - a); }

function createBi(w, h) {
  return {
    id: Math.random(),
    x: rand(0, w),
    y: -rand(20, 120),
    vy: rand(1.5, 3.5),
    vx: rand(-0.3, 0.3),
    size: rand(18, 36),
    opacity: rand(0.5, 1),
    char: "비",
    alive: true,
  };
}

function createFragment(x, y, char, parentSize) {
  const angle = rand(0, Math.PI * 2);
  const speed = rand(2, 6);
  return {
    id: Math.random(),
    x,
    y,
    vx: Math.cos(angle) * speed,
    vy: -rand(2, 5),
    char,
    size: parentSize * rand(0.6, 1),
    opacity: 1,
    life: 1,
    gravity: 0.12,
    rotation: rand(-30, 30),
    rotSpeed: rand(-8, 8),
  };
}

export default function RainScene({ onClose }) {
  const canvasRef = useRef(null);
  const animRef = useRef(null);
  const dropsRef = useRef([]);
  const fragsRef = useRef([]);
  const umbrellaRef = useRef({ x: 50, y: 60 });
  const [umbrella, setUmbrella] = useState({ x: 50, y: 60 });
  const [isDragging, setIsDragging] = useState(false);
  const containerRef = useRef(null);
  const sizeRef = useRef({ w: 800, h: 600 });
  const spawnTimer = useRef(0);
  const scoreRef = useRef(0);
  const [score, setScore] = useState(0);

  useEffect(() => {
    const handleKey = (e) => { if (e.key === "Escape") onClose?.(); };
    window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
  }, [onClose]);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;
    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");

    function resize() {
      const w = container.clientWidth;
      const h = container.clientHeight;
      canvas.width = w * window.devicePixelRatio;
      canvas.height = h * window.devicePixelRatio;
      canvas.style.width = w + "px";
      canvas.style.height = h + "px";
      ctx.setTransform(window.devicePixelRatio, 0, 0, window.devicePixelRatio, 0, 0);
      sizeRef.current = { w, h };
    }
    resize();
    window.addEventListener("resize", resize);

    const UMB_W_RATIO = 0.16;
    const UMB_TOP_OFFSET = -8;

    function loop() {
      const { w, h } = sizeRef.current;
      ctx.clearRect(0, 0, w, h);

      spawnTimer.current++;
      if (spawnTimer.current % 8 === 0) {
        dropsRef.current.push(createBi(w, h));
      }
      if (dropsRef.current.length > 80) {
        dropsRef.current = dropsRef.current.slice(-80);
      }

      const ux = (umbrellaRef.current.x / 100) * w;
      const uy = (umbrellaRef.current.y / 100) * h;
      const uHalfW = (UMB_W_RATIO / 2) * w;
      const uTop = uy + UMB_TOP_OFFSET;

      dropsRef.current = dropsRef.current.filter((d) => {
        if (!d.alive) return false;
        d.y += d.vy;
        d.x += d.vx;

        const dx = d.x - ux;
        const dy = d.y - uTop;
        const arcH = 18;
        if (Math.abs(dx) < uHalfW && dy > -arcH && dy < arcH + 6 && d.y > uTop - arcH) {
          const parts = DECOMPOSE_MAP[d.char] || [d.char];
          parts.forEach((ch) => fragsRef.current.push(createFragment(d.x, d.y, ch, d.size)));
          scoreRef.current++;
          setScore(scoreRef.current);
          return false;
        }

        if (d.y > h - 20) {
          const parts = DECOMPOSE_MAP[d.char] || [d.char];
          parts.forEach((ch) => fragsRef.current.push(createFragment(d.x, h - 20, ch, d.size)));
          return false;
        }

        ctx.save();
        ctx.font = `900 ${d.size}px 'Noto Sans KR', sans-serif`;
        ctx.fillStyle = `rgba(255,255,255,${d.opacity})`;
        ctx.textAlign = "center";
        ctx.textBaseline = "middle";
        ctx.fillText(d.char, d.x, d.y);
        ctx.restore();

        return true;
      });

      fragsRef.current = fragsRef.current.filter((f) => {
        f.x += f.vx;
        f.y += f.vy;
        f.vy += f.gravity;
        f.vx *= 0.99;
        f.life -= 0.012;
        f.opacity = Math.max(0, f.life);
        f.rotation += f.rotSpeed;

        if (f.life <= 0) return false;

        ctx.save();
        ctx.translate(f.x, f.y);
        ctx.rotate((f.rotation * Math.PI) / 180);
        ctx.font = `700 ${f.size}px 'Noto Sans KR', sans-serif`;
        ctx.fillStyle = `rgba(255,255,255,${f.opacity})`;
        ctx.textAlign = "center";
        ctx.textBaseline = "middle";
        ctx.fillText(f.char, 0, 0);
        ctx.restore();

        return true;
      });

      if (fragsRef.current.length > 200) {
        fragsRef.current = fragsRef.current.slice(-200);
      }

      ctx.beginPath();
      ctx.moveTo(0, h - 10);
      ctx.lineTo(w, h - 10);
      ctx.strokeStyle = "rgba(255,255,255,0.08)";
      ctx.lineWidth = 1;
      ctx.stroke();

      animRef.current = requestAnimationFrame(loop);
    }

    animRef.current = requestAnimationFrame(loop);
    return () => {
      cancelAnimationFrame(animRef.current);
      window.removeEventListener("resize", resize);
    };
  }, []);

  const getPos = useCallback((e) => {
    const rect = containerRef.current.getBoundingClientRect();
    const clientX = e.touches ? e.touches[0].clientX : e.clientX;
    const clientY = e.touches ? e.touches[0].clientY : e.clientY;
    return {
      x: Math.max(5, Math.min(95, ((clientX - rect.left) / rect.width) * 100)),
      y: Math.max(10, Math.min(85, ((clientY - rect.top) / rect.height) * 100)),
    };
  }, []);

  const handleDown = useCallback((e) => {
    e.preventDefault();
    setIsDragging(true);
    const pos = getPos(e);
    umbrellaRef.current = pos;
    setUmbrella(pos);
  }, [getPos]);

  const handleMove = useCallback((e) => {
    if (!isDragging) return;
    e.preventDefault();
    const pos = getPos(e);
    umbrellaRef.current = pos;
    setUmbrella(pos);
  }, [isDragging, getPos]);

  const handleUp = useCallback(() => setIsDragging(false), []);

  return (
    <div
      ref={containerRef}
      style={{
        position: "fixed",
        inset: 0,
        zIndex: 9999,
        background: "#08080c",
        overflow: "hidden",
        cursor: isDragging ? "grabbing" : "grab",
        userSelect: "none",
      }}
      onMouseDown={handleDown}
      onMouseMove={handleMove}
      onMouseUp={handleUp}
      onMouseLeave={handleUp}
      onTouchStart={handleDown}
      onTouchMove={handleMove}
      onTouchEnd={handleUp}
    >
      <link
        href="https://fonts.googleapis.com/css2?family=Noto+Sans+KR:wght@300;700;900&display=swap"
        rel="stylesheet"
      />

      <canvas
        ref={canvasRef}
        style={{ position: "absolute", inset: 0, zIndex: 5, pointerEvents: "none" }}
      />

      <div
        style={{
          position: "absolute",
          left: `${umbrella.x}%`,
          top: `${umbrella.y}%`,
          transform: "translate(-50%, -50%)",
          pointerEvents: "none",
          zIndex: 10,
          filter: "drop-shadow(0 6px 20px rgba(0,0,0,0.5))",
          transition: isDragging ? "none" : "left 0.08s, top 0.08s",
        }}
      >
        <svg width="130" height="140" viewBox="0 0 130 140" fill="none">
          <path d="M8 68 C8 22, 122 22, 122 68 Z" fill="#E8A838" />
          <path d="M32 68 C34 42, 55 34, 55 68 Z" fill="#F2C560" opacity="0.45" />
          <path d="M55 68 C55 34, 76 34, 76 68 Z" fill="#F5D078" opacity="0.25" />
          <path d="M76 68 C76 38, 98 44, 98 68 Z" fill="#F2C560" opacity="0.2" />
          <path
            d="M8 68 C18 74, 28 68, 38 74 C48 68, 58 74, 68 68 C78 74, 88 68, 98 74 C108 68, 118 74, 122 68"
            stroke="#D4942E" strokeWidth="2.5" fill="none"
          />
          <line x1="65" y1="68" x2="65" y2="122" stroke="#8B6914" strokeWidth="3" strokeLinecap="round" />
          <path d="M65 122 C65 133, 50 133, 50 125" stroke="#8B6914" strokeWidth="3" fill="none" strokeLinecap="round" />
          <ellipse cx="48" cy="46" rx="14" ry="5" fill="rgba(255,255,255,0.12)" />
        </svg>
      </div>

      {/* 점수 */}
      <div
        style={{
          position: "absolute",
          top: 20,
          right: 60,
          color: "rgba(255,255,255,0.25)",
          fontSize: "14px",
          fontFamily: "'Noto Sans KR', sans-serif",
          fontWeight: 300,
          zIndex: 20,
          pointerEvents: "none",
        }}
      >
        ☂ {score}
      </div>

      {/* 닫기 버튼 */}
      <button
        onClick={onClose}
        style={{
          position: "absolute",
          top: 16,
          right: 20,
          zIndex: 30,
          background: "rgba(255,255,255,0.08)",
          border: "1px solid rgba(255,255,255,0.15)",
          color: "rgba(255,255,255,0.5)",
          borderRadius: "8px",
          width: 32,
          height: 32,
          cursor: "pointer",
          fontSize: "16px",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          lineHeight: 1,
        }}
        title="닫기 (ESC)"
      >
        ✕
      </button>

      {/* 안내 텍스트 */}
      <div
        style={{
          position: "absolute",
          bottom: 20,
          left: "50%",
          transform: "translateX(-50%)",
          color: "rgba(255,255,255,0.25)",
          fontSize: "13px",
          fontFamily: "'Noto Sans KR', sans-serif",
          fontWeight: 300,
          zIndex: 20,
          pointerEvents: "none",
          whiteSpace: "nowrap",
        }}
      >
        드래그하여 우산을 움직이세요
      </div>

      {/* 비네트 */}
      <div
        style={{
          position: "absolute",
          inset: 0,
          background: "radial-gradient(ellipse at center, transparent 30%, rgba(0,0,0,0.5) 100%)",
          pointerEvents: "none",
          zIndex: 15,
        }}
      />
    </div>
  );
}
