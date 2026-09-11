import React, { useState, useEffect, useRef } from 'react';
import { PartyPopper, Trophy, Sparkles, X, Award, CheckCircle2 } from 'lucide-react';
import { Button } from './Button';

// Trigger programmatically from anywhere
export const triggerPointsCelebration = ({ amount, reason, newTotal }) => {
  window.dispatchEvent(
    new CustomEvent('knowpass-celebration', {
      detail: { amount, reason, newTotal },
    })
  );
};

// Polyphonic Web Audio celebration chime
const playCelebrationChime = () => {
  try {
    const AudioCtx = window.AudioContext || window.webkitAudioContext;
    if (!AudioCtx) return;
    const ctx = new AudioCtx();

    const notes = [523.25, 659.25, 783.99, 1046.5];
    const now = ctx.currentTime;

    notes.forEach((freq, idx) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = 'triangle';
      osc.frequency.setValueAtTime(freq, now + idx * 0.08);

      gain.gain.setValueAtTime(0.001, now + idx * 0.08);
      gain.gain.exponentialRampToValueAtTime(0.2, now + idx * 0.08 + 0.03);
      gain.gain.exponentialRampToValueAtTime(0.0001, now + idx * 0.08 + 0.5);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start(now + idx * 0.08);
      osc.stop(now + idx * 0.08 + 0.55);
    });
  } catch {
    // AudioContext blocked or unsupported - silently ignore
  }
};

export function CelebrationModal() {
  const [data, setData] = useState(null);
  const canvasRef = useRef(null);
  const animFrameRef = useRef(null);
  const autoCloseTimerRef = useRef(null);

  useEffect(() => {
    const handleCelebration = (e) => {
      if (e.detail && e.detail.amount) {
        setData(e.detail);
        playCelebrationChime();
      }
    };

    window.addEventListener('knowpass-celebration', handleCelebration);
    return () => {
      window.removeEventListener('knowpass-celebration', handleCelebration);
    };
  }, []);

  // Launch Canvas Party Poppers when data is active
  useEffect(() => {
    if (!data) return;

    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let width = (canvas.width = window.innerWidth);
    let height = (canvas.height = window.innerHeight);

    const handleResize = () => {
      if (!canvas) return;
      width = canvas.width = window.innerWidth;
      height = canvas.height = window.innerHeight;
    };
    window.addEventListener('resize', handleResize);

    const colors = [
      '#6366f1', '#4f46e5',
      '#ec4899', '#db2777',
      '#f59e0b', '#d97706',
      '#10b981', '#059669',
      '#06b6d4', '#0891b2',
      '#8b5cf6', '#7c3aed',
      '#ef4444', '#dc2626',
    ];

    const particles = [];

    const spawnPopperBlast = (originX, originY, baseAngle, count = 85) => {
      for (let i = 0; i < count; i++) {
        const spread = (Math.random() - 0.5) * 1.1;
        const angle = baseAngle + spread;
        const velocity = 16 + Math.random() * 22;
        const size = 6 + Math.random() * 8;
        const isRibbon = Math.random() > 0.4;
        const color = colors[Math.floor(Math.random() * colors.length)];

        particles.push({
          x: originX,
          y: originY,
          vx: Math.cos(angle) * velocity,
          vy: Math.sin(angle) * velocity,
          size,
          isRibbon,
          color,
          rotation: Math.random() * Math.PI * 2,
          rotationSpeed: (Math.random() - 0.5) * 0.25,
          gravity: 0.42 + Math.random() * 0.15,
          drag: 0.982,
          wobble: Math.random() * 10,
          wobbleSpeed: 0.05 + Math.random() * 0.08,
          opacity: 1,
          decay: 0.005 + Math.random() * 0.007,
        });
      }
    };

    // Cannon 1: Bottom-Left Cannon shooting Upper-Right (~60 deg)
    spawnPopperBlast(width * 0.12, height * 0.92, -Math.PI / 3, 90);

    // Cannon 2: Bottom-Right Cannon shooting Upper-Left (~120 deg)
    spawnPopperBlast(width * 0.88, height * 0.92, (-2 * Math.PI) / 3, 90);

    // Cannon 3: Mid-air center burst after 350ms
    const midBurstTimer = setTimeout(() => {
      spawnPopperBlast(width * 0.5, height * 0.6, -Math.PI / 2, 70);
    }, 350);

    let isRunning = true;
    const render = () => {
      if (!isRunning) return;
      ctx.clearRect(0, 0, width, height);

      for (let i = particles.length - 1; i >= 0; i--) {
        const p = particles[i];

        p.vx *= p.drag;
        p.vy = p.vy * p.drag + p.gravity;
        p.x += p.vx + Math.sin(p.wobble) * 1.2;
        p.y += p.vy;
        p.wobble += p.wobbleSpeed;
        p.rotation += p.rotationSpeed;
        p.opacity -= p.decay;

        if (p.opacity <= 0 || p.y > height + 20) {
          particles.splice(i, 1);
          continue;
        }

        ctx.save();
        ctx.globalAlpha = Math.max(0, p.opacity);
        ctx.translate(p.x, p.y);
        ctx.rotate(p.rotation);
        ctx.fillStyle = p.color;

        if (p.isRibbon) {
          ctx.fillRect(-p.size / 2, -p.size * 1.6, p.size, p.size * 3.2);
        } else {
          if (i % 2 === 0) {
            ctx.beginPath();
            ctx.arc(0, 0, p.size / 2, 0, Math.PI * 2);
            ctx.fill();
          } else {
            ctx.fillRect(-p.size / 2, -p.size / 2, p.size, p.size);
          }
        }
        ctx.restore();
      }

      if (particles.length > 0) {
        animFrameRef.current = requestAnimationFrame(render);
      }
    };

    animFrameRef.current = requestAnimationFrame(render);

    autoCloseTimerRef.current = setTimeout(() => {
      setData(null);
    }, 5000);

    return () => {
      isRunning = false;
      clearTimeout(midBurstTimer);
      clearTimeout(autoCloseTimerRef.current);
      window.removeEventListener('resize', handleResize);
      if (animFrameRef.current) cancelAnimationFrame(animFrameRef.current);
    };
  }, [data]);

  const handleDismiss = () => {
    setData(null);
    if (autoCloseTimerRef.current) clearTimeout(autoCloseTimerRef.current);
  };

  if (!data) return null;

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4">
      <canvas
        ref={canvasRef}
        className="fixed inset-0 pointer-events-none z-10 w-full h-full"
      />

      <div
        onClick={handleDismiss}
        className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm transition-opacity duration-300 animate-in fade-in"
      />

      <div className="relative z-20 max-w-sm sm:max-w-md w-full bg-white/95 backdrop-blur-md rounded-3xl p-6 sm:p-8 border border-amber-200/80 shadow-2xl shadow-amber-500/20 text-center space-y-5 animate-in zoom-in-95 duration-300">
        <button
          onClick={handleDismiss}
          className="absolute top-4 right-4 p-1.5 rounded-full text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition"
          aria-label="Close"
        >
          <X className="w-4 h-4" />
        </button>

        <div className="relative mx-auto w-20 h-20">
          <div className="absolute inset-0 rounded-full bg-gradient-to-tr from-amber-400 via-rose-400 to-indigo-500 blur-lg opacity-70 animate-pulse" />
          <div className="relative w-20 h-20 rounded-2xl bg-gradient-to-tr from-amber-50 to-amber-100 border-2 border-amber-300 flex items-center justify-center text-amber-600 shadow-md">
            <PartyPopper className="w-10 h-10 animate-bounce" />
          </div>
          <Sparkles className="w-5 h-5 text-amber-500 absolute -top-2 -right-2 animate-spin [animation-duration:6s]" />
          <Award className="w-4 h-4 text-indigo-500 absolute -bottom-1 -left-1" />
        </div>

        <div className="space-y-2">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-50 border border-amber-200 text-amber-800 text-xs font-extrabold uppercase tracking-wider">
            <span>🎉 Knowledge Rewarded</span>
          </div>

          <h2 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
            +{data.amount} KnowPoints!
          </h2>

          <p className="text-xs sm:text-sm text-slate-600 leading-relaxed max-w-xs mx-auto">
            {data.reason || 'Outstanding academic contribution to the campus network!'}
          </p>
        </div>

        {data.newTotal !== undefined && (
          <div className="p-3 bg-gradient-to-r from-amber-50/70 via-indigo-50/70 to-emerald-50/70 rounded-2xl border border-slate-200/80 flex items-center justify-between text-xs">
            <span className="text-slate-500 font-medium flex items-center gap-1.5">
              <Trophy className="w-4 h-4 text-amber-500" />
              New Campus Balance:
            </span>
            <span className="font-extrabold text-slate-900 bg-white px-2.5 py-1 rounded-xl shadow-xs border border-slate-200">
              {Number(data.newTotal).toLocaleString()} pts 🪙
            </span>
          </div>
        )}

        <div className="pt-2">
          <Button
            onClick={handleDismiss}
            className="w-full text-xs sm:text-sm py-3 bg-gradient-to-r from-indigo-600 via-indigo-700 to-indigo-800 hover:from-indigo-700 hover:to-indigo-900 text-white shadow-lg shadow-indigo-600/30 rounded-2xl font-bold flex items-center justify-center gap-2"
          >
            <CheckCircle2 className="w-4 h-4" />
            Claim & Celebrate 🚀
          </Button>
        </div>

        <div className="h-1 bg-slate-100 rounded-full overflow-hidden">
          <div className="h-full bg-gradient-to-r from-amber-400 to-indigo-600 animate-[shrink_5s_linear_forwards] w-full" />
        </div>
      </div>
    </div>
  );
}
