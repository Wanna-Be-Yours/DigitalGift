import { useState, useEffect, useRef, useCallback } from "react";
import "./app.css";
import girlNeutral from "./assets/girl-neutral.png";
import girlSmile from "./assets/girl-smile.png";
import pixelSunset from "./assets/pixel-sunset.png";

// ── Particle types ──────────────────────────────────────────────────────────
interface Particle {
  id: number;
  x: number;
  y: number;
  size: number;
  speedX: number;
  speedY: number;
  opacity: number;
  color: string;
  type: "heart" | "star" | "dot";
  rotation: number;
  rotSpeed: number;
}

interface Sparkle {
  id: number;
  x: number;
  y: number;
}

// ── Pixel Heart SVG ──────────────────────────────────────────────────────────
const PixelHeart = ({ size = 12, color = "#ff6b9d" }: { size?: number; color?: string }) => (
  <svg width={size} height={size} viewBox="0 0 10 10" style={{ imageRendering: "pixelated" }}>
    <rect x="1" y="2" width="2" height="1" fill={color} />
    <rect x="7" y="2" width="2" height="1" fill={color} />
    <rect x="0" y="3" width="4" height="2" fill={color} />
    <rect x="6" y="3" width="4" height="2" fill={color} />
    <rect x="0" y="5" width="10" height="2" fill={color} />
    <rect x="1" y="7" width="8" height="1" fill={color} />
    <rect x="2" y="8" width="6" height="1" fill={color} />
    <rect x="3" y="9" width="4" height="1" fill={color} />
    <rect x="4" y="10" width="2" height="1" fill={color} />
  </svg>
);

const PixelStar = ({ size = 12, color = "#ffd6e0" }: { size?: number; color?: string }) => (
  <svg width={size} height={size} viewBox="0 0 10 10" style={{ imageRendering: "pixelated" }}>
    <rect x="4" y="0" width="2" height="2" fill={color} />
    <rect x="4" y="8" width="2" height="2" fill={color} />
    <rect x="0" y="4" width="2" height="2" fill={color} />
    <rect x="8" y="4" width="2" height="2" fill={color} />
    <rect x="3" y="3" width="4" height="4" fill={color} />
    <rect x="2" y="2" width="2" height="2" fill={color} />
    <rect x="6" y="2" width="2" height="2" fill={color} />
    <rect x="2" y="6" width="2" height="2" fill={color} />
    <rect x="6" y="6" width="2" height="2" fill={color} />
  </svg>
);

// ── Main App ─────────────────────────────────────────────────────────────────
export default function App() {
  const [isHovered, setIsHovered] = useState(false);
  const [particles, setParticles] = useState<Particle[]>([]);
  const [sparkles, setSparkles] = useState<Sparkle[]>([]);
  const [countdown, setCountdown] = useState(3);
  const [showCard, setShowCard] = useState(false);
  const [letterLine, setLetterLine] = useState(0);
  const animRef = useRef<number>(0);
  const sparkleId = useRef(0);
  const particleId = useRef(0);
  const hoverTimeout = useRef<NodeJS.Timeout | null>(null);

  const PARTICLE_COLORS = [
    "#ffb3c6", "#ff6b9d", "#ffd6e0", "#c77dff",
    "#ff9a3c", "#ffccd5", "#e0aaff", "#ffc8dd",
  ];

  const memoryImages = [
    "/images/l1.jpg",
    "/images/l2.jpg",
    "/images/l3.jpg",
    "/images/l4.jpg"
  ];

  // ── Hover handlers with delay ──────────────────────────────────────────
  const handleMouseEnter = () => {
    // Only use hover on non-touch devices if possible, 
    // but for simplicity we allow both and use click to toggle on mobile.
    if (window.matchMedia("(pointer: fine)").matches) {
      if (hoverTimeout.current) clearTimeout(hoverTimeout.current);
      setIsHovered(true);
    }
  };

  const handleMouseLeave = () => {
    if (window.matchMedia("(pointer: fine)").matches) {
      hoverTimeout.current = setTimeout(() => {
        setIsHovered(false);
      }, 600);
    }
  };

  const handleCardClick = (e: React.MouseEvent) => {
    // Prevent sparkle trigger from background if needed, or let it pass
    // For mobile, we toggle.
    if (!window.matchMedia("(pointer: fine)").matches) {
      setIsHovered(!isHovered);
      e.stopPropagation(); // Don't trigger sparkle on app-root
    }
  };

  // ── Initialise particles ────────────────────────────────────────────────
  useEffect(() => {
    const init: Particle[] = Array.from({ length: 30 }, () => ({
      id: particleId.current++,
      x: Math.random() * 100,
      y: Math.random() * 100,
      size: Math.random() * 6 + 3,
      speedX: (Math.random() - 0.5) * 0.04,
      speedY: -(Math.random() * 0.06 + 0.02),
      opacity: Math.random() * 0.6 + 0.2,
      color: PARTICLE_COLORS[Math.floor(Math.random() * PARTICLE_COLORS.length)],
      type: (["heart", "star", "dot"] as const)[Math.floor(Math.random() * 3)],
      rotation: Math.random() * 360,
      rotSpeed: (Math.random() - 0.5) * 1.5,
    }));
    setParticles(init);
  }, []);

  // ── Animate particles ────────────────────────────────────────────────────
  useEffect(() => {
    const tick = () => {
      setParticles((prev) =>
        prev.map((p) => {
          let { x, y, speedX, speedY, opacity, rotation, rotSpeed } = p;
          x += speedX;
          y += speedY;
          rotation += rotSpeed;
          if (y < -5) { y = 105; x = Math.random() * 100; opacity = Math.random() * 0.6 + 0.2; }
          if (x < -5) x = 105;
          if (x > 105) x = -5;
          return { ...p, x, y, opacity, rotation };
        })
      );
      animRef.current = requestAnimationFrame(tick);
    };
    animRef.current = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(animRef.current);
  }, []);

  // ── Sparkle on click ─────────────────────────────────────────────────────
  const handleClick = useCallback((e: React.MouseEvent) => {
    const id = sparkleId.current++;
    const newSparkle: Sparkle = { id, x: e.clientX, y: e.clientY };
    setSparkles((prev) => [...prev, newSparkle]);
    setTimeout(() => setSparkles((prev) => prev.filter((s) => s.id !== id)), 900);
  }, []);

  // ── 3-Second Countdown Logic ─────────────────────────────────────────────
  useEffect(() => {
    if (countdown > 0) {
      const timer = setTimeout(() => setCountdown(countdown - 1), 1000);
      return () => clearTimeout(timer);
    } else {
      setShowCard(true);
    }
  }, [countdown]);

  const handleReveal = () => {
    setShowCard(true);
  };

  // ── Typewriter for letter lines ──────────────────────────────────────────
  useEffect(() => {
    if (!showCard) return;
    const interval = setInterval(() => {
      setLetterLine((l) => (l < 5 ? l + 1 : l));
    }, 600);
    return () => clearInterval(interval);
  }, [showCard]);

  const letterLines = [
    "To my dearest Mumutt,",
    "Every moment with you feels like",
    "a soft dream I never want to leave.",
    "gentle, warm, and perfectly mine. 🌸",
  ];

  return (
    <div className="app-root" onClick={handleClick}>
      <div className="pixel-bg" style={{ backgroundImage: `url(${pixelSunset})` }} />
      <div className="bg-overlay" />

      <div className="particles-layer" aria-hidden>
        {particles.map((p) => (
          <div
            key={p.id}
            className="particle"
            style={{
              left: `${p.x}%`,
              top: `${p.y}%`,
              opacity: p.opacity,
              transform: `rotate(${p.rotation}deg)`,
            }}
          >
            {p.type === "heart" && <PixelHeart size={p.size * 2} color={p.color} />}
            {p.type === "star" && <PixelStar size={p.size * 2} color={p.color} />}
            {p.type === "dot" && (
              <div
                style={{
                  width: p.size,
                  height: p.size,
                  backgroundColor: p.color,
                  borderRadius: "1px",
                }}
              />
            )}
          </div>
        ))}
      </div>

      <div className="effects-layer">
        {sparkles.map((s) => (
          <div key={s.id} className="sparkle-burst" style={{ left: s.x, top: s.y }}>
            {Array.from({ length: 8 }).map((_, i) => (
              <div key={i} className="sparkle-ray" style={{ "--angle": `${i * 45}deg` } as React.CSSProperties} />
            ))}
            <div className="sparkle-heart">
              <PixelHeart size={16} color="#ff6b9d" />
            </div>
          </div>
        ))}
      </div>

      <main className="ui-container">
        {!showCard && (
          <div className="countdown-splash">
            <div className="countdown-circle">
              <span className="countdown-number">{countdown}</span>
            </div>
            <p className="countdown-text">Preparing a special surprise... ✨</p>
          </div>
        )}

        {showCard && (
          <div className="main-layout fade-in-up">
            <div className="card-column">
              <div
                className="gift-card pixel-border"
                onClick={handleCardClick}
                onMouseEnter={handleMouseEnter}
                onMouseLeave={handleMouseLeave}
              >
                <div className="card-header">
                  <div className="header-dots">
                    <span className="hdot hdot-red" />
                    <span className="hdot hdot-yellow" />
                    <span className="hdot hdot-green" />
                  </div>
                  <span className="header-label">✦ Sweetest Gift ✦</span>
                </div>

                <div className="card-title-section">
                  <p className="card-subtitle">with love, always</p>
                  <h1 className="card-title">Buat<br />Mumuttttt</h1>
                  <div className="title-underline">
                    <span className="ul-left" />
                    <span className="ul-heart"><PixelHeart size={10} color="#ff6b9d" /></span>
                    <span className="ul-right" />
                  </div>
                </div>

                <div
                  className="image-frame pixel-frame-border"
                >
                  <span className="corner corner-tl" />
                  <span className="corner corner-tr" />
                  <span className="corner corner-bl" />
                  <span className="corner corner-br" />

                  <img
                    src={girlNeutral}
                    alt="A beautiful girl"
                    className={`frame-img img-neutral ${isHovered ? "img-hidden" : "img-visible"}`}
                  />
                  <img
                    src={girlSmile}
                    alt="A smiling beautiful girl"
                    className={`frame-img img-smile ${isHovered ? "img-visible" : "img-hidden"}`}
                  />

                  <div className={`frame-overlay ${isHovered ? "overlay-visible" : ""}`}>
                    <div className="overlay-stars">✦ ✦ ✦</div>
                    <p className="overlay-text">A prettiest princess<br />I ever meet</p>
                    <div className="overlay-hearts">
                      <PixelHeart size={12} color="#fff" />
                      <PixelHeart size={10} color="#ffd6e0" />
                      <PixelHeart size={12} color="#fff" />
                    </div>
                  </div>
                </div>

                <div className="card-quote-section">
                  <p className="quote-text">
                    "You're the soft light at the end<br />of every hard day — my peace,<br />my joy, my everything. 🌸"
                  </p>
                </div>

                <div className="icon-row">
                  <span className="deco-icon" title="heart">🍓</span>
                  <PixelHeart size={16} color="#ff6b9d" />
                  <span className="deco-icon" title="ribbon">🎀</span>
                  <PixelHeart size={12} color="#c77dff" />
                  <span className="deco-icon" title="flower">🌸</span>
                  <PixelHeart size={16} color="#ff9a3c" />
                  <span className="deco-icon" title="strawberry">🍓</span>
                </div>

                <div className="card-footer">
                  <span className="footer-label">forever yours 💕</span>
                </div>
              </div>
            </div>

            <div className={`right-column ${isHovered ? "revealed" : ""}`}>
              <div className={`love-letter pixel-border-soft reveal-section ${isHovered ? "visible" : ""}`}>
                <div className="letter-header">
                  <PixelHeart size={14} color="#ff6b9d" />
                  <span className="letter-title">Love Letter 1</span>
                  <PixelHeart size={14} color="#ff6b9d" />
                </div>
                <div className="letter-lines">
                  {letterLines.map((line, i) => (
                    <p
                      key={i}
                      className={`letter-line ${letterLine > i ? "line-visible" : "line-hidden"}`}
                      style={{ transitionDelay: `${i * 0.1}s`, fontStyle: i === 0 ? "italic" : "normal" }}
                    >
                      {line}
                    </p>
                  ))}
                </div>
              </div>

              <div className={`memory-card pixel-border-soft reveal-section ${isHovered ? "visible" : ""}`} style={{ transitionDelay: "0.1s" }}>
                <div className="letter-header">
                  <PixelHeart size={14} color="#c77dff" />
                  <span className="letter-title">Memory Lane</span>
                  <PixelHeart size={14} color="#c77dff" />
                </div>
                <div className="letter-gallery">
                  {memoryImages.map((img, idx) => (
                    <div key={idx} className="gallery-item pixel-frame-border">
                      <img src={img} alt={`Memory ${idx + 1}`} className="gallery-img" />
                    </div>
                  ))}
                </div>
                <p className="image-caption">✦ Every pixel of you is beautiful ✦</p>
              </div>

              <div className={`bars-section reveal-section ${isHovered ? "visible" : ""}`} style={{ transitionDelay: "0.2s" }}>
                <div className="bars-panel pixel-border-soft">
                  <div className="bars-title">
                    <span className="pixel-label">✦ Status Board ✦</span>
                  </div>
                  <div className="bar-row">
                    <span className="bar-label">Affection</span>
                    <div className="bar-track">
                      <div className="bar-fill bar-fill-1" style={{ width: "92%" }}><span className="bar-value">92%</span></div>
                    </div>
                  </div>
                  <div className="bar-row">
                    <span className="bar-label">Cuteness</span>
                    <div className="bar-track">
                      <div className="bar-fill bar-fill-2" style={{ width: "100%" }}><span className="bar-value">MAX</span></div>
                    </div>
                  </div>
                  <div className="bar-row">
                    <span className="bar-label">Prettiest</span>
                    <div className="bar-track">
                      <div className="bar-fill bar-fill-3" style={{ width: "100%" }}><span className="bar-value">100%</span></div>
                    </div>
                  </div>
                  <div className="bar-row">
                    <span className="bar-label">Sweetest</span>
                    <div className="bar-track bar-track-empty">
                      <div className="bar-fill bar-fill-4" style={{ width: "100%" }}><span className="bar-value">100%</span></div>
                    </div>
                  </div>
                  <div className="status-tags">
                    <span className="tag tag-pink">✦ ACTIVE</span>
                    <span className="tag tag-purple">♥ IN LOVE</span>
                    <span className="tag tag-peach">★ RARE</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </main>

      <div className="scanlines" aria-hidden />
    </div>
  );
}
