// Landing.jsx — Baby Monitor landing screen

const TWEAK_DEFAULTS = /*EDITMODE-BEGIN*/{
  "blueHue": 230,
  "pinkHue": 350,
  "orbCount": 6,
  "blurAmount": 90,
  "motionSpeed": 1,
  "glassOpacity": 0.18,
  "glassBlur": 28,
  "showGrain": true,
  "showOrbs": true
}/*EDITMODE-END*/;

// Pseudo-random but deterministic orb positions/sizes
const ORB_SEED = [
  { x: 18, y: 22, size: 280, color: 'blue',  delay: 0,    duration: 22, dx: 32, dy: -18 },
  { x: 72, y: 12, size: 220, color: 'pink',  delay: -6,   duration: 26, dx: -28, dy: 24 },
  { x: 12, y: 68, size: 320, color: 'pink',  delay: -12,  duration: 30, dx: 24, dy: -22 },
  { x: 78, y: 72, size: 260, color: 'blue',  delay: -3,   duration: 28, dx: -30, dy: -16 },
  { x: 45, y: 40, size: 340, color: 'mix',   delay: -9,   duration: 34, dx: 18, dy: 22 },
  { x: 58, y: 88, size: 200, color: 'pink',  delay: -15,  duration: 24, dx: -22, dy: -28 },
  { x: 88, y: 45, size: 180, color: 'blue',  delay: -18,  duration: 20, dx: -24, dy: 20 },
  { x: 8,  y: 8,  size: 200, color: 'mix',   delay: -2,   duration: 32, dx: 28, dy: 30 },
];

function Orb({ idx, x, y, size, color, delay, duration, dx, dy, blueHue, pinkHue, speed }) {
  const blueColor = `oklch(0.82 0.09 ${blueHue})`;
  const pinkColor = `oklch(0.84 0.10 ${pinkHue})`;
  const mixA = `oklch(0.86 0.08 ${(blueHue + pinkHue) / 2})`;

  let from, to;
  if (color === 'blue') {
    from = blueColor; to = `oklch(0.78 0.11 ${blueHue + 15})`;
  } else if (color === 'pink') {
    from = pinkColor; to = `oklch(0.80 0.12 ${pinkHue - 10})`;
  } else {
    from = mixA; to = pinkColor;
  }

  const animDuration = duration / speed;

  // Use the shared `orbDrift` keyframes; per-orb dx/dy come from CSS custom
  // properties (set via setProperty so the values actually land on the node).
  const ref = React.useRef(null);
  React.useEffect(() => {
    if (!ref.current) return;
    ref.current.style.setProperty('--dx', `${dx}px`);
    ref.current.style.setProperty('--dy', `${dy}px`);
    ref.current.style.setProperty('--dx-half', `${dx * 0.6}px`);
    ref.current.style.setProperty('--dy-half', `${dy * 0.4}px`);
  }, [dx, dy]);

  return (
    <div
      ref={ref}
      style={{
        position: 'absolute',
        left: `${x}%`,
        top: `${y}%`,
        width: size,
        height: size,
        marginLeft: -size / 2,
        marginTop: -size / 2,
        borderRadius: '50%',
        background: `radial-gradient(circle at 35% 35%, ${from} 0%, ${to} 60%, transparent 100%)`,
        opacity: 0.9,
        animation: `orbDrift ${animDuration}s ease-in-out ${delay}s infinite alternate`,
        willChange: 'transform',
      }}
    />
  );
}

function Landing() {
  const [tweaks, setTweak] = useTweaks(TWEAK_DEFAULTS);
  const {
    blueHue, pinkHue, orbCount, blurAmount, motionSpeed,
    glassOpacity, glassBlur, showGrain, showOrbs,
  } = tweaks;

  const orbs = ORB_SEED.slice(0, orbCount);

  // base bg — soft pastel cream/lavender to feel nursery-like
  const bgGradient = `
    radial-gradient(ellipse at 20% 0%, oklch(0.93 0.05 ${blueHue}) 0%, transparent 55%),
    radial-gradient(ellipse at 80% 100%, oklch(0.93 0.05 ${pinkHue}) 0%, transparent 55%),
    linear-gradient(180deg, oklch(0.97 0.012 ${(blueHue + pinkHue) / 2}) 0%, oklch(0.95 0.018 ${pinkHue}) 100%)
  `;

  return (
    <>
      <style>{`
        @keyframes orbDrift {
          0%   { transform: translate(0px, 0px) scale(1); }
          50%  { transform: translate(var(--dx-half, 0px), var(--dy-half, 0px)) scale(1.08); }
          100% { transform: translate(var(--dx, 0px), var(--dy, 0px)) scale(0.94); }
        }
        @keyframes fadeUp {
          from { opacity: 0; transform: translateY(12px); }
          to   { opacity: 1; transform: translateY(0); }
        }
      `}</style>

      <div style={{
        position: 'absolute', inset: 0,
        overflow: 'hidden',
        background: bgGradient,
      }}>
        {/* Orb layer — this is the "blurred video" feel */}
        {showOrbs && (
          <div style={{
            position: 'absolute', inset: 0,
            filter: `blur(${blurAmount}px)`,
            transform: 'translateZ(0)',
          }}>
            {orbs.map((o, i) => (
              <Orb key={i} idx={i} {...o} blueHue={blueHue} pinkHue={pinkHue} speed={motionSpeed} />
            ))}
          </div>
        )}

        {/* subtle grain to sell the "video frame" */}
        {showGrain && (
          <div style={{
            position: 'absolute', inset: 0,
            opacity: 0.28,
            mixBlendMode: 'overlay',
            backgroundImage:
              `url("data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='160' height='160'><filter id='n'><feTurbulence baseFrequency='0.9' numOctaves='2' stitchTiles='stitch'/><feColorMatrix values='0 0 0 0 0  0 0 0 0 0  0 0 0 0 0  0 0 0 0.5 0'/></filter><rect width='100%' height='100%' filter='url(%23n)'/></svg>")`,
            pointerEvents: 'none',
          }} />
        )}

        {/* very faint vignette to mimic camera lens */}
        <div style={{
          position: 'absolute', inset: 0,
          background: 'radial-gradient(ellipse at center, transparent 50%, rgba(40,30,60,0.18) 100%)',
          pointerEvents: 'none',
        }} />

        {/* Foreground content — vertically centered above home indicator */}
        <div style={{
          position: 'absolute', inset: 0,
          display: 'flex', flexDirection: 'column',
          alignItems: 'center', justifyContent: 'center',
          padding: '0 28px',
          zIndex: 5,
        }}>
          {/* No card — content sits directly on the blurred orb background */}
          <div style={{
            width: '100%',
            padding: '0 12px',
            animation: 'fadeUp 0.9s cubic-bezier(.2,.7,.2,1) both',
          }}>
            {/* Wordmark */}
            <div style={{ textAlign: 'center', marginBottom: 10 }}>
              <div style={{
                fontFamily: '"Inter", -apple-system, system-ui, sans-serif',
                fontWeight: 700,
                fontSize: 38,
                lineHeight: 1.05,
                letterSpacing: -1.2,
                color: 'oklch(0.22 0.03 270)',
                textShadow: '0 1px 0 rgba(255,255,255,0.6)',
              }}>
                Baby Monitor
              </div>
              <div style={{
                marginTop: 6,
                fontFamily: '"Inter", -apple-system, system-ui, sans-serif',
                fontWeight: 500,
                fontSize: 13,
                letterSpacing: 4,
                textTransform: 'uppercase',
                color: 'oklch(0.45 0.04 280)',
              }}>
                ninthbox
              </div>
            </div>

            {/* Tagline */}
            <div style={{
              marginTop: 28, marginBottom: 32,
              textAlign: 'center',
              fontFamily: '"Inter", -apple-system, system-ui, sans-serif',
              fontSize: 14,
              lineHeight: 1.55,
              color: 'oklch(0.38 0.03 280)',
              letterSpacing: -0.1,
              textWrap: 'pretty',
              padding: '0 12px',
            }}>
              Secure peer-to-peer video <br />
              talk-back with motion detection
            </div>

            {/* Buttons */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              {/* Primary: Sign up */}
              <button style={{
                height: 54,
                borderRadius: 16,
                border: 'none',
                cursor: 'pointer',
                fontFamily: '"Inter", -apple-system, system-ui, sans-serif',
                fontSize: 16,
                fontWeight: 600,
                letterSpacing: -0.2,
                color: '#fff',
                background: `linear-gradient(180deg, oklch(0.62 0.13 ${(blueHue + pinkHue) / 2 + 10}) 0%, oklch(0.50 0.15 ${(blueHue + pinkHue) / 2 - 5}) 100%)`,
                boxShadow:
                  '0 1px 0 rgba(255,255,255,0.35) inset, ' +
                  '0 -1px 0 rgba(0,0,0,0.10) inset, ' +
                  '0 10px 24px -8px oklch(0.50 0.15 ' + ((blueHue + pinkHue) / 2) + ' / 0.55)',
                transition: 'transform 0.15s ease, box-shadow 0.15s ease',
              }}
                onMouseDown={(e) => e.currentTarget.style.transform = 'scale(0.98)'}
                onMouseUp={(e) => e.currentTarget.style.transform = 'scale(1)'}
                onMouseLeave={(e) => e.currentTarget.style.transform = 'scale(1)'}
              >
                Sign up
              </button>

              {/* Secondary: Log in */}
              <button style={{
                height: 54,
                borderRadius: 16,
                cursor: 'pointer',
                fontFamily: '"Inter", -apple-system, system-ui, sans-serif',
                fontSize: 16,
                fontWeight: 600,
                letterSpacing: -0.2,
                color: 'oklch(0.30 0.04 280)',
                background: 'rgba(255,255,255,0.55)',
                border: '1px solid rgba(255,255,255,0.7)',
                backdropFilter: 'blur(8px)',
                WebkitBackdropFilter: 'blur(8px)',
                boxShadow:
                  '0 1px 0 rgba(255,255,255,0.7) inset, ' +
                  '0 4px 12px -4px rgba(40, 30, 80, 0.12)',
                transition: 'transform 0.15s ease',
              }}
                onMouseDown={(e) => e.currentTarget.style.transform = 'scale(0.98)'}
                onMouseUp={(e) => e.currentTarget.style.transform = 'scale(1)'}
                onMouseLeave={(e) => e.currentTarget.style.transform = 'scale(1)'}
              >
                Log in
              </button>
            </div>

            {/* tiny helper line */}
            <div style={{
              marginTop: 18,
              textAlign: 'center',
              fontFamily: '"Inter", -apple-system, system-ui, sans-serif',
              fontSize: 11,
              letterSpacing: 0.3,
              color: 'oklch(0.50 0.03 280)',
            }}>
              By continuing you agree to our&nbsp;
              <span style={{ color: 'oklch(0.40 0.10 ' + ((blueHue + pinkHue) / 2) + ')', fontWeight: 500 }}>Terms</span>
              &nbsp;&middot;&nbsp;
              <span style={{ color: 'oklch(0.40 0.10 ' + ((blueHue + pinkHue) / 2) + ')', fontWeight: 500 }}>Privacy</span>
            </div>
          </div>
        </div>
      </div>

      {/* Tweaks panel */}
      <TweaksPanel title="Tweaks">
        <TweakSection title="Color">
          <TweakSlider label="Blue hue" value={blueHue} min={200} max={260} step={1}
            onChange={(v) => setTweak('blueHue', v)} />
          <TweakSlider label="Pink hue" value={pinkHue} min={320} max={380} step={1}
            onChange={(v) => setTweak('pinkHue', v)} />
        </TweakSection>
        <TweakSection title="Motion">
          <TweakSlider label="Orbs" value={orbCount} min={2} max={8} step={1}
            onChange={(v) => setTweak('orbCount', v)} />
          <TweakSlider label="Blur" value={blurAmount} min={20} max={140} step={2}
            onChange={(v) => setTweak('blurAmount', v)} />
          <TweakSlider label="Speed" value={motionSpeed} min={0.3} max={2.5} step={0.1}
            onChange={(v) => setTweak('motionSpeed', v)} />
          <TweakToggle label="Show orbs" value={showOrbs}
            onChange={(v) => setTweak('showOrbs', v)} />
          <TweakToggle label="Film grain" value={showGrain}
            onChange={(v) => setTweak('showGrain', v)} />
        </TweakSection>

      </TweaksPanel>
    </>
  );
}

function App() {
  return (
    <div style={{
      minHeight: '100vh',
      width: '100%',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      padding: 32,
      boxSizing: 'border-box',
      background: 'oklch(0.96 0.005 270)',
      fontFamily: '"Inter", -apple-system, system-ui, sans-serif',
    }} data-screen-label="01 Landing">
      <IOSDevice width={390} height={844} dark={false}>
        <Landing />
      </IOSDevice>
    </div>
  );
}

ReactDOM.createRoot(document.getElementById('root')).render(<App />);
