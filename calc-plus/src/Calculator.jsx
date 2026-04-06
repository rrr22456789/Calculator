import { useState, useCallback, useEffect } from "react";

function beep(type) {
  try {
    const ctx = new (window.AudioContext || window.webkitAudioContext)();
    const o = ctx.createOscillator(), g = ctx.createGain();
    o.connect(g); g.connect(ctx.destination);
    const f = { num: 400, plus: 560, eq: 640, c: 220, del: 320 };
    o.type = type === "eq" ? "triangle" : "sine";
    o.frequency.value = f[type] || 400;
    g.gain.setValueAtTime(0.06, ctx.currentTime);
    g.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.1);
    o.start(); o.stop(ctx.currentTime + 0.1);
  } catch (_) {}
}

export default function Calculator() {
  const [total, setTotal]   = useState(0);
  const [entry, setEntry]   = useState("");
  const [tape,  setTape]    = useState([]);
  const [animKey, setAnimKey] = useState(0);
  const [pressed, setPressed] = useState(null);

  const bump = () => setAnimKey(k => k + 1);

  const displayVal = entry !== "" ? entry : total.toLocaleString("en-IN");
  const dl = displayVal.replace(/,/g, "").length;
  const fs = dl <= 3 ? 112 : dl <= 5 ? 88 : dl <= 7 ? 70 : dl <= 9 ? 54 : 42;

  // Keyboard support
  useEffect(() => {
    const handler = (e) => {
      if (e.key >= "0" && e.key <= "9") handleDigit(e.key);
      else if (e.key === "+" || e.key === "Enter") e.key === "+" ? handlePlus() : handleEquals();
      else if (e.key === "Backspace") handleDel();
      else if (e.key === "Escape") handleC();
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  });

  const flash = (k) => {
    setPressed(k);
    setTimeout(() => setPressed(null), 140);
  };

  const handleDigit = useCallback((d) => {
    beep("num"); flash(d);
    setEntry(prev => {
      if (prev.length >= 12) return prev;
      if (prev === "0") return d;
      return prev + d;
    });
  }, []);

  const handlePlus = useCallback(() => {
    beep("plus"); flash("+");
    setTotal(t => {
      const num = parseFloat(entry) || 0;
      if (entry !== "") { setTape(tp => [...tp, entry]); bump(); }
      setEntry("");
      return entry !== "" ? t + num : t;
    });
  }, [entry]);

  const handleEquals = useCallback(() => {
    beep("eq"); flash("=");
    setTotal(t => {
      const num = parseFloat(entry) || 0;
      if (entry !== "") { setTape(tp => [...tp, entry]); bump(); }
      setEntry("");
      return entry !== "" ? t + num : t;
    });
  }, [entry]);

  const handleC = useCallback(() => {
    beep("c"); flash("C");
    setTotal(0); setEntry(""); setTape([]); bump();
  }, []);

  // FIXED: backspace logic
  // - If typing: delete last digit
  // - If entry empty & tape has items: undo last addition, bring it back into entry
  // - If entry empty & tape empty & total != 0: put total into entry for editing
  const handleDel = useCallback(() => {
    beep("del"); flash("←");
    if (entry !== "") {
      setEntry(prev => prev.length > 1 ? prev.slice(0, -1) : "");
    } else if (tape.length > 0) {
      const lastStr = tape[tape.length - 1];
      const lastNum = parseFloat(lastStr) || 0;
      setTape(tp => tp.slice(0, -1));
      setTotal(t => t - lastNum);
      setEntry(lastStr);
      bump();
    } else if (total !== 0) {
      setEntry(String(total));
      setTotal(0);
      bump();
    }
  }, [entry, tape, total]);

  const tapeItems = tape.slice(-5);
  const tapeStr = tapeItems.length > 0
    ? (tape.length > 5 ? "⋯ + " : "") + tapeItems.join(" + ") + " +"
    : "";

  const ip = (k) => pressed === k;

  return (
    <div className="shell">
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Nunito:wght@900&display=swap');
        *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; -webkit-tap-highlight-color: transparent; }

        :root {
          --bg:       #dedad6;
          --face:     #e6e2de;
          --face-hi:  #f0ede9;
          --face-lo:  #cac6c2;
          --shadow-d: rgba(0,0,0,0.28);
          --shadow-l: rgba(255,255,255,0.80);
          --dark:     #1c1c1c;
          --dark2:    #2e2e2e;
          --ink:      #1e1e1e;
          --ink-dim:  #9a9692;
        }

        html, body, #root { height: 100%; }

        .shell {
          min-height: 100vh;
          min-height: 100dvh;
          background: var(--bg);
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .phone {
          width: min(390px, 100vw);
          min-height: 100vh;
          min-height: 100dvh;
          background: var(--bg);
          display: flex;
          flex-direction: column;
          overflow: hidden;
        }

        /* ── Display ── */
        .disp {
          flex: 1;
          display: flex;
          flex-direction: column;
          align-items: flex-end;
          justify-content: flex-end;
          padding: 48px 28px 20px;
          gap: 4px;
        }

        .tape {
          font-family: 'Courier New', monospace;
          font-size: 13px;
          color: var(--ink-dim);
          min-height: 20px;
          letter-spacing: 0.03em;
          text-align: right;
          width: 100%;
        }

        .numbox {
          width: 100%;
          display: flex;
          justify-content: flex-end;
          align-items: baseline;
          overflow: hidden;
        }

        .num {
          font-family: 'Nunito', sans-serif;
          font-weight: 900;
          line-height: 1;
          letter-spacing: -0.02em;
          text-align: right;
          white-space: nowrap;
          user-select: none;
          /* pressed-metal gradient */
          background: linear-gradient(160deg, #b0aca8 0%, #7a7672 40%, #4a4642 100%);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
          transition: font-size 0.15s ease;
        }

        @keyframes pop {
          0%   { transform: scale(0.88); opacity: 0.3; }
          65%  { transform: scale(1.03); }
          100% { transform: scale(1);    opacity: 1;   }
        }
        .pop { animation: pop 0.22s cubic-bezier(0.34,1.56,0.64,1) both; }

        /* ── Button area ── */
        .btn-area {
          padding: 8px 14px 40px;
          display: flex;
          flex-direction: column;
          gap: 10px;
        }

        .top-row  { display: grid; grid-template-columns: 1fr 1fr; gap: 10px; }
        .mid-grid { display: grid; grid-template-columns: repeat(3, 1fr) 1.6fr; grid-template-rows: repeat(3, 1fr); gap: 10px; }
        .bot-row  { display: grid; grid-template-columns: 2fr 1fr; gap: 10px; }

        /* ─── PHYSICAL BUTTON SYSTEM ─── */
        /* All buttons share this base — raised slab look */
        .btn {
          border: none;
          cursor: pointer;
          display: flex;
          align-items: center;
          justify-content: center;
          outline: none;
          user-select: none;
          border-radius: 20px;
          position: relative;
          /* critical: the bottom edge that makes it look 3D */
          transition: box-shadow 70ms ease, transform 70ms ease, background 70ms ease;
          /* prevent ghost clicks */
          touch-action: manipulation;
        }

        /* ── Number keys ── */
        .bn {
          height: 90px;
          font-family: system-ui, -apple-system, sans-serif;
          font-size: 36px;
          font-weight: 500;
          color: var(--ink);
          background: linear-gradient(155deg, var(--face-hi) 0%, var(--face) 50%, var(--face-lo) 100%);
          box-shadow:
            0 6px 0 #b0ada9,               /* bottom hard edge — the "thickness" */
            0 8px 16px rgba(0,0,0,0.22),   /* drop shadow */
            inset 0 1px 0 rgba(255,255,255,0.85); /* top highlight */
        }
        .bn.down {
          transform: translateY(5px);
          background: linear-gradient(155deg, var(--face-lo) 0%, #d0ccc8 100%);
          box-shadow:
            0 1px 0 #b0ada9,
            0 2px 4px rgba(0,0,0,0.18),
            inset 0 2px 6px rgba(0,0,0,0.12);
        }

        /* ── Utility: C ← ── */
        .bu {
          height: 62px;
          font-family: system-ui, -apple-system, sans-serif;
          font-size: 22px;
          font-weight: 500;
          color: var(--ink-dim);
          background: linear-gradient(155deg, var(--face-hi) 0%, var(--face) 50%, var(--face-lo) 100%);
          box-shadow:
            0 5px 0 #aaa6a2,
            0 7px 14px rgba(0,0,0,0.2),
            inset 0 1px 0 rgba(255,255,255,0.85);
        }
        .bu.down {
          transform: translateY(4px);
          background: linear-gradient(155deg, var(--face-lo) 0%, #d0ccc8 100%);
          box-shadow:
            0 1px 0 #aaa6a2,
            0 2px 4px rgba(0,0,0,0.14),
            inset 0 2px 5px rgba(0,0,0,0.10);
        }

        /* ── Big + key ── */
        .bp {
          font-family: system-ui, -apple-system, sans-serif;
          font-size: 68px;
          font-weight: 200;
          color: #fff;
          grid-column: 4;
          grid-row: 1 / span 3;
          border-radius: 24px;
          height: 100%;
          min-height: 290px;
          background: linear-gradient(160deg, #323232 0%, #181818 100%);
          box-shadow:
            0 7px 0 #0a0a0a,
            0 10px 24px rgba(0,0,0,0.45),
            inset 0 1px 0 rgba(255,255,255,0.12);
          letter-spacing: -0.04em;
        }
        .bp.down {
          transform: translateY(6px);
          background: linear-gradient(160deg, #161616 0%, #222 100%);
          box-shadow:
            0 1px 0 #0a0a0a,
            0 3px 8px rgba(0,0,0,0.4),
            inset 0 3px 10px rgba(0,0,0,0.4);
        }

        /* ── Zero key (wide) ── */
        .bz {
          height: 90px;
          font-family: system-ui, -apple-system, sans-serif;
          font-size: 36px;
          font-weight: 500;
          color: var(--ink);
          justify-content: flex-start;
          padding-left: 32px;
          background: linear-gradient(155deg, var(--face-hi) 0%, var(--face) 50%, var(--face-lo) 100%);
          box-shadow:
            0 6px 0 #b0ada9,
            0 8px 16px rgba(0,0,0,0.22),
            inset 0 1px 0 rgba(255,255,255,0.85);
        }
        .bz.down {
          transform: translateY(5px);
          background: linear-gradient(155deg, var(--face-lo) 0%, #d0ccc8 100%);
          box-shadow:
            0 1px 0 #b0ada9,
            0 2px 4px rgba(0,0,0,0.18),
            inset 0 2px 6px rgba(0,0,0,0.12);
        }

        /* ── Equals key ── */
        .be {
          height: 90px;
          font-family: system-ui, -apple-system, sans-serif;
          font-size: 32px;
          font-weight: 400;
          color: #fff;
          letter-spacing: 0.1em;
          background: linear-gradient(155deg, #484848 0%, #252525 100%);
          box-shadow:
            0 6px 0 #0e0e0e,
            0 9px 20px rgba(0,0,0,0.38),
            inset 0 1px 0 rgba(255,255,255,0.1);
        }
        .be.down {
          transform: translateY(5px);
          background: linear-gradient(155deg, #1e1e1e 0%, #303030 100%);
          box-shadow:
            0 1px 0 #0e0e0e,
            0 2px 5px rgba(0,0,0,0.32),
            inset 0 3px 8px rgba(0,0,0,0.35);
        }
      `}</style>

      <div className="phone">
        {/* Display */}
        <div className="disp">
          <div className="tape">{tapeStr || "\u00a0"}</div>
          <div className="numbox">
            <span key={animKey} className="num pop" style={{ fontSize: fs }}>
              {displayVal}
            </span>
          </div>
        </div>

        {/* Buttons */}
        <div className="btn-area">
          <div className="top-row">
            <button className={`btn bu${ip("C") ? " down" : ""}`} onPointerDown={handleC}>C</button>
            <button className={`btn bu${ip("←") ? " down" : ""}`} onPointerDown={handleDel} style={{ fontSize: 28 }}>←</button>
          </div>

          <div className="mid-grid">
            {["7","8","9","4","5","6","1","2","3"].map(d => (
              <button key={d} className={`btn bn${ip(d) ? " down" : ""}`} onPointerDown={() => handleDigit(d)}>{d}</button>
            ))}
            <button className={`btn bp${ip("+") ? " down" : ""}`} onPointerDown={handlePlus} style={{ gridColumn: 4, gridRow: "1 / span 3" }}>+</button>
          </div>

          <div className="bot-row">
            <button className={`btn bz${ip("0") ? " down" : ""}`} onPointerDown={() => handleDigit("0")}>0</button>
            <button className={`btn be${ip("=") ? " down" : ""}`} onPointerDown={handleEquals}>=</button>
          </div>
        </div>
      </div>
    </div>
  );
}
