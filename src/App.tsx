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
  type: "heart" | "star" | "dot" | "sakura" | "bubble";
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
const letterLines = [
  "To my dearest Mumuttt,",
  "Every moment with you feels like",
  "a soft dream I never want to leave.",
  "gentle, warm, and perfectly mine. 🌸",
];

const birthdayLines = [
  "Happy Birthday, Mutiaa! 🎂",
  "Sama kaya yang aku bilang sebelumnya",
  "Selamat Ulang Tahun Yaa",
  "Sebelumnya maafin yaa",
  "Aku cuman bisa website ginian",
  "Aku belum bisa beliin ini itu.",
  "",
  "Ini first time nya aku bikin",
  "Digital gift yang se niat ini",
  "sorry banget yaa kalo jelek",
  "Semogaa kamu sukaa yaa.",
  "",
  "Aku bukan orang yang bisa",
  "Nyanyiin kamu sebuah lagu",
  "Bukan juga sebagai pemain musik",
  "Dan juga gabisa ngajak kamu jalan",
  "Aku cuman seseroang yang selalu",
  "Berusaha buat seseorang yangg aku cintain",
  
  "I Loved You"
  
];

export default function App() {
  const [isHovered, setIsHovered] = useState(false);
  const [isLocked, setIsLocked] = useState(false);
  const isRevealed = isHovered || isLocked;
  const [particles, setParticles] = useState<Particle[]>([]);
  const [sparkles, setSparkles] = useState<Sparkle[]>([]);
  const [countdown, setCountdown] = useState(3);
  const [showCard, setShowCard] = useState(false);
  const [letterLine, setLetterLine] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);

  // Typewriter State
  const [typedLetter, setTypedLetter] = useState<string[]>(letterLines.map(() => ""));
  const [typedBirthdayLetter, setTypedBirthdayLetter] = useState<string[]>(birthdayLines.map(() => ""));

  // Voice Note State
  const [isVoicePlaying, setIsVoicePlaying] = useState(false);
  const [voiceTime, setVoiceTime] = useState(0);
  const [voiceDuration, setVoiceDuration] = useState(0);

  const animRef = useRef<number>(0);
  const sparkleId = useRef(0);
  const particleId = useRef(0);
  const hoverTimeout = useRef<NodeJS.Timeout | null>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const voiceRef = useRef<HTMLAudioElement | null>(null);

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
      setIsHovered(false);
    }
  };

  const handleCardClick = (e: React.MouseEvent) => {
    // Toggle locked state on click
    const newLockedState = !isLocked;
    setIsLocked(newLockedState);
    
    // If we are unlocking, also force hover state to false so it actually hides 
    // even if the mouse is still over the card
    if (!newLockedState) {
      setIsHovered(false);
    }
    
    e.stopPropagation();
  };

  // ── Voice Note Handlers ────────────────────────────────────────────────
  const toggleVoice = () => {
    if (voiceRef.current) {
      if (isVoicePlaying) voiceRef.current.pause();
      else voiceRef.current.play();
      setIsVoicePlaying(!isVoicePlaying);
    }
  };

  const handleVoiceTimeUpdate = () => {
    if (voiceRef.current) setVoiceTime(voiceRef.current.currentTime);
  };

  const handleVoiceLoadedMetadata = () => {
    if (voiceRef.current) setVoiceDuration(voiceRef.current.duration);
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
      type: (["heart", "star", "dot", "sakura", "bubble"] as const)[Math.floor(Math.random() * 5)],
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

  // ── Typewriter Effect for Love Letter ──────────────────────────────────
  useEffect(() => {
    if (isRevealed) {
      let currentLine = 0;
      let currentChar = 0;
      const timer = setInterval(() => {
        setTypedLetter(prev => {
          const next = [...prev];
          if (currentLine < letterLines.length) {
            next[currentLine] = letterLines[currentLine].substring(0, currentChar + 1);
            currentChar++;
            if (currentChar > letterLines[currentLine].length) {
              currentLine++;
              currentChar = 0;
            }
          }
          return next;
        });
      }, 30);
      return () => clearInterval(timer);
    } else {
      setTypedLetter(letterLines.map(() => ""));
    }
  }, [isRevealed]);

  useEffect(() => {
    if (isRevealed) {
      let currentLine = 0;
      let currentChar = 0;
      const timer = setInterval(() => {
        setTypedBirthdayLetter(prev => {
          const next = [...prev];
          if (currentLine < birthdayLines.length) {
            next[currentLine] = birthdayLines[currentLine].substring(0, currentChar + 1);
            currentChar++;
            if (currentChar > birthdayLines[currentLine].length) {
              currentLine++;
              currentChar = 0;
            }
          }
          return next;
        });
      }, 40);
      return () => clearInterval(timer);
    } else {
      setTypedBirthdayLetter(birthdayLines.map(() => ""));
    }
  }, [isRevealed]);

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

  // ── Audio Logic ─────────────────────────────────────────────────────────────
  const togglePlay = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (audioRef.current) {
      if (isPlaying) {
        audioRef.current.pause();
      } else {
        audioRef.current.play();
      }
      setIsPlaying(!isPlaying);
    }
  };

  const handleTimeUpdate = () => {
    if (audioRef.current) {
      setCurrentTime(audioRef.current.currentTime);
    }
  };

  const handleLoadedMetadata = () => {
    if (audioRef.current) {
      setDuration(audioRef.current.duration);
    }
  };

  const formatTime = (time: number) => {
    const minutes = Math.floor(time / 60);
    const seconds = Math.floor(time % 60);
    return `${minutes}:${seconds < 10 ? "0" : ""}${seconds}`;
  };

  const handleProgressClick = (e: React.MouseEvent<HTMLDivElement>) => {
    e.stopPropagation();
    if (audioRef.current && duration) {
      const rect = e.currentTarget.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const clickedTime = (x / rect.width) * duration;
      audioRef.current.currentTime = clickedTime;
      setCurrentTime(clickedTime);
    }
  };

  const handleVoiceProgressClick = (e: React.MouseEvent<HTMLDivElement>) => {
    e.stopPropagation();
    if (voiceRef.current && voiceDuration) {
      const rect = e.currentTarget.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const clickedTime = (x / rect.width) * voiceDuration;
      voiceRef.current.currentTime = clickedTime;
      setVoiceTime(clickedTime);
    }
  };

  // ── Typewriter for letter lines ──────────────────────────────────────────
  useEffect(() => {
    if (!showCard) return;
    const interval = setInterval(() => {
      setLetterLine((l) => (l < 5 ? l + 1 : l));
    }, 600);
    return () => clearInterval(interval);
  }, [showCard]);


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
            {p.type === "sakura" && <span style={{ fontSize: p.size * 2, filter: `drop-shadow(0 0 2px ${p.color})` }}>🌸</span>}
            {p.type === "bubble" && (
              <div
                style={{
                  width: p.size,
                  height: p.size,
                  border: `1.5px solid ${p.color}`,
                  borderRadius: "50%",
                  opacity: 0.6,
                }}
              />
            )}
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
                className={`gift-card pixel-border ${isRevealed ? "is-revealed" : ""}`}
                onClick={handleCardClick}
                onMouseEnter={handleMouseEnter}
                onMouseLeave={handleMouseLeave}
              >
                {/* Scrapbook Stickers */}
                <div className="sticker sticker-top-left">🍓</div>
                <div className="sticker sticker-bottom-right">🎀</div>
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
                  <h1 className="card-title">Buat<br />Mumuttt</h1>
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
                    className={`frame-img img-neutral ${isRevealed ? "img-hidden" : "img-visible"}`}
                  />
                  <img
                    src={girlSmile}
                    alt="A smiling beautiful girl"
                    className={`frame-img img-smile ${isRevealed ? "img-visible" : "img-hidden"}`}
                  />

                  <div className={`frame-overlay ${isRevealed ? "overlay-visible" : ""}`}>
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

            <div className={`side-column middle-side ${isRevealed ? "revealed" : ""}`}>
              <div className={`love-letter pixel-border-soft reveal-section ${isRevealed ? "visible" : ""}`} style={{ transitionDelay: "0.1s" }}>
                <div className="sticker sticker-top-right">🌸</div>
                <div className="letter-header">
                  <PixelHeart size={14} color="#ff6b9d" />
                  <span className="letter-title">Love Letter</span>
                  <PixelHeart size={14} color="#ff6b9d" />
                </div>
                <div className="letter-lines">
                  {typedLetter.map((line, i) => (
                    <p
                      key={i}
                      className="letter-line line-visible"
                      style={{ fontStyle: i === 0 ? "italic" : "normal" }}
                    >
                      {line}
                    </p>
                  ))}
                </div>
              </div>

              <div className={`memory-card pixel-border-soft reveal-section ${isRevealed ? "visible" : ""}`} style={{ transitionDelay: "0.3s" }}>
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

              <div className={`bars-section reveal-section ${isRevealed ? "visible" : ""}`} style={{ transitionDelay: "0.5s" }}>
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

            <div className={`side-column right-side ${isRevealed ? "revealed" : ""}`}>
              <div className="right-side-content-container">
                {/* Card 1: Music Player */}
                <div className={`music-card-section reveal-section ${isRevealed ? "visible" : ""}`} style={{ transitionDelay: "0.7s" }}>
                  <div className="music-card pixel-border-soft">
                    <div className="sticker sticker-bottom-left">🎶</div>
                    <div className="music-card-paper">
                      <div className="music-tag">I wanna be yours</div>
                      <div className="music-album-art">
                        <img src="/images/wannabeyours.png" alt="I Wanna Be Yours" className="album-img" />
                      </div>

                      <div className="music-info">
                        <div className="info-text">
                          <h3 className="song-title">I Wanna be yours</h3>
                          <p className="artist-name">Arctic Monkeys</p>
                        </div>
                        <div className="info-heart">
                          <PixelHeart size={18} color="#e63946" />
                        </div>
                      </div>

                      <div className="music-controls">
                        <div className="progress-container" onClick={handleProgressClick}>
                          <div className="progress-bar">
                            <div
                              className="progress-fill"
                              style={{ width: `${(currentTime / duration) * 100 || 0}%` }}
                            />
                            <div
                              className="progress-knob"
                              style={{ left: `${(currentTime / duration) * 100 || 0}%` }}
                            >
                              <PixelHeart size={14} color="#ff6b9d" />
                            </div>
                          </div>
                          <div className="time-info">
                            <span>{formatTime(currentTime)}</span>
                            <span>{formatTime(duration)}</span>
                          </div>
                        </div>

                        <div className="playback-buttons">
                          <button className="control-btn shuffle-btn">
                            <svg viewBox="0 0 24 24" width="18" height="18"><path fill="currentColor" d="M14.83,13.41L13.42,14.82L16.59,18H15c-2.02,0-3.92-1.12-4.9-2.92l-1.35-2.48l1.41-1.42l1.35,2.48C12.1,14.71,13.49,16,15,16h1.59 L14.83,13.41z M15,8c-1.51,0-2.9,1.29-3.49,2.34l-1.35,2.48l-1.41-1.42l1.35-2.48C9.67,7.12,11.57,6,13.59,6H16.59l-1.76-1.76 L16.24,2.83L21.41,8l-5.17,5.17l-1.41-1.41L16.59,10H15z M10.51,9.09l-1.42,1.41L7.24,8.65C6.59,7.67,5.49,7.09,4.3,7.09H3v-2 h1.3c1.9,0,3.66,0.92,4.74,2.47L10.51,9.09z M7.24,15.35L9.09,16.5l-1.42,1.41L6.74,17.2C5.66,18.5,3.9,19.41,2,19.41H0.7v-2h1.3 C3.21,17.41,4.31,16.33,4.95,15.35z"/></svg>
                          </button>
                          <button className="control-btn prev-btn">
                            <svg viewBox="0 0 24 24" width="22" height="22"><path fill="currentColor" d="M6 6h2v12H6zm3.5 6L19 18V6z"/></svg>
                          </button>
                          <button className="control-btn play-pause-btn" onClick={togglePlay}>
                            {isPlaying ? (
                              <svg viewBox="0 0 24 24" width="32" height="32"><path fill="currentColor" d="M6 19h4V5H6v14zm8-14v14h4V5h-4z"/></svg>
                            ) : (
                              <svg viewBox="0 0 24 24" width="32" height="32"><path fill="currentColor" d="M8 5v14l11-7z"/></svg>
                            )}
                          </button>
                          <button className="control-btn next-btn">
                            <svg viewBox="0 0 24 24" width="22" height="22"><path fill="currentColor" d="M6 18l8.5-6L6 6v12zM16 6v12h2V6h-2z"/></svg>
                          </button>
                          <button className="control-btn repeat-btn">
                            <svg viewBox="0 0 24 24" width="18" height="18"><path fill="currentColor" d="M7 7h10v3l4-4-4-4v3H5v6h2V7zm10 10H7v-3l-4 4 4 4v-3h12v-6h-2v4z"/></svg>
                          </button>
                        </div>
                      </div>
                    </div>
                    
                    <audio
                      ref={audioRef}
                      src="/audio/I%20Wanna%20Be%20Yours.m4a"
                      onTimeUpdate={handleTimeUpdate}
                      onLoadedMetadata={handleLoadedMetadata}
                      onEnded={() => setIsPlaying(false)}
                    />
                  </div>
                </div>

                {/* Card 2: Voice Note Player (Refined) */}
                <div className={`voice-note-section reveal-section ${isRevealed ? "visible" : ""}`} style={{ transitionDelay: "0.8s" }}>
                  <div className="voice-note-card refined-card pixel-border-soft">
                    <div className="sticker sticker-bottom-right">🎤</div>
                    
                    <div className="voice-note-layout">
                      {/* Left: Avatar with Badges */}
                      <div className="voice-avatar-area">
                        <div className="main-avatar-circle">
                          <img src="/images/zenn.webp" alt="Zenn" className="avatar-img" />
                          <div className="badge-icon icon-left">
                            <svg viewBox="0 0 24 24" width="14" height="14"><path fill="white" d="M12 3v10.55c-.59-.34-1.27-.55-2-.55-2.21 0-4 1.79-4 4s1.79 4 4 4 4-1.79 4-4V7h4V3h-6z"/></svg>
                          </div>
                          <div className="badge-icon icon-right">
                            <svg viewBox="0 0 24 24" width="14" height="14"><path fill="white" d="M17 10.5V7c0-.55-.45-1-1-1H4c-.55 0-1 .45-1 1v10c0 .55.45 1 1 1h12c.55 0 1-.45 1-1v-3.5l4 4v-11l-4 4z"/></svg>
                          </div>
                        </div>
                      </div>

                      {/* Center: Main Card Content */}
                      <div className="voice-content-area">
                        <div className="voice-top-bubble">
                          <button className="bubble-play">▶</button>
                          <div className="bubble-waveform">
                            <div className="wave-bars">
                              {[1,2,3,4,5].map(i => <div key={i} className="wave-bar" style={{height: '40%'}} />)}
                              <div className="wave-heart"><PixelHeart size={14} color="#000" /></div>
                              {[1,2,3,4,5].map(i => <div key={i} className="wave-bar" style={{height: '40%'}} />)}
                            </div>
                          </div>
                        </div>

                        <div className="voice-mid-controls">
                           <span className="mid-icon heart-icon"><PixelHeart size={10} color="#ffb3c6" /></span>
                           <span className="mid-icon"><svg viewBox="0 0 24 24" width="14" height="14"><path fill="#ffb3c6" d="M6 6h2v12H6zm3.5 6L19 18V6z"/></svg></span>
                           <span className="mid-icon"><svg viewBox="0 0 24 24" width="16" height="16"><path fill="#ffb3c6" d="M8 5v14l11-7z"/></svg></span>
                           <span className="mid-icon"><svg viewBox="0 0 24 24" width="14" height="14"><path fill="#ffb3c6" d="M6 18l8.5-6L6 6v12zM16 6v12h2V6h-2z"/></svg></span>
                           <div className="mid-volume-container">
                             <div className="mid-volume-line"></div>
                             <div className="mid-volume-knob"></div>
                           </div>
                        </div>

                        <div className="voice-controls-area">
                          <div className="voice-playback-row">
                            <button className="control-btn play-pause-btn" onClick={(e) => { e.stopPropagation(); toggleVoice(); }}>
                              {isVoicePlaying ? (
                                <svg viewBox="0 0 24 24" width="32" height="32"><path fill="currentColor" d="M6 19h4V5H6v14zm8-14v14h4V5h-4z"/></svg>
                              ) : (
                                <svg viewBox="0 0 24 24" width="32" height="32"><path fill="currentColor" d="M8 5v14l11-7z"/></svg>
                              )}
                            </button>
                            
                            <div className="progress-container" onClick={handleVoiceProgressClick} style={{ flex: 1, marginBottom: 0 }}>
                              <div className="progress-bar">
                                <div
                                  className="progress-fill"
                                  style={{ width: `${(voiceTime / voiceDuration) * 100 || 0}%` }}
                                />
                                <div
                                  className="progress-knob"
                                  style={{ left: `${(voiceTime / voiceDuration) * 100 || 0}%` }}
                                >
                                  <PixelHeart size={14} color="#ff6b9d" />
                                </div>
                              </div>
                              <div className="time-info">
                                <span>{formatTime(voiceTime)}</span>
                                <span>{formatTime(voiceDuration)}</span>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>

                    <audio
                      ref={voiceRef}
                      src="/audio/myvoice.mp3"
                      onTimeUpdate={handleVoiceTimeUpdate}
                      onLoadedMetadata={handleVoiceLoadedMetadata}
                      onEnded={() => setIsVoicePlaying(false)}
                    />
                  </div>
                </div>

                {/* Card 3: Birthday Letter (The Last Letter) */}
                <div className={`birthday-letter-section reveal-section ${isRevealed ? "visible" : ""}`} style={{ transitionDelay: "0.9s" }}>
                  <div className="love-letter pixel-border-soft">
                    <div className="sticker sticker-top-right">🎂</div>
                    <div className="letter-header">
                      <PixelHeart size={14} color="#ff6b9d" />
                      <span className="letter-title">Birthday Wish</span>
                      <PixelHeart size={14} color="#ff6b9d" />
                    </div>
                    <div className="letter-lines">
                      {typedBirthdayLetter.map((line, i) => (
                        <p
                          key={i}
                          className="letter-line line-visible"
                          style={{ 
                            fontStyle: i === 0 ? "italic" : "normal", 
                            fontWeight: i === 0 ? "bold" : "normal",
                            color: i === 0 ? "#c44569" : "#6d2b4a"
                          }}
                        >
                          {line}
                        </p>
                      ))}
                    </div>
                    <div className="letter-signature">
                      Forever yours, Zenn ✨
                    </div>
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
