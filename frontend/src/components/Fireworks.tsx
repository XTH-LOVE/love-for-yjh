import React, { useEffect, useRef, useCallback } from 'react';

/* ================================================================
   Fireworks Canvas Component - 烟花特效
   ================================================================ */

interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  alpha: number;
  color: string;
  size: number;
  trail: Array<{ x: number; y: number }>;
}

interface FireworkShell {
  x: number;
  y: number;
  vy: number;
  targetY: number;
  color: string;
  exploded: boolean;
}

const COLORS = [
  '#ff6b9d', '#ff2d78', '#e91e63', '#c2185b',
  '#ffadd5', '#ff85a2', '#ffd700', '#ff9a9e',
  '#a78bfa', '#34d399', '#60a5fa', '#f472b6',
];

export function FireworksCanvas({ active = true }: { active?: boolean }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animRef = useRef<number>(0);
  const shellsRef = useRef<FireworkShell[]>([]);
  const particlesRef = useRef<Particle[]>([]);
  const lastLaunchRef = useRef<number>(0);

  const explode = useCallback((x: number, y: number, color: string) => {
    const count = 80 + Math.floor(Math.random() * 40);
    for (let i = 0; i < count; i++) {
      const angle = (i / count) * Math.PI * 2;
      const speed = 1.5 + Math.random() * 3.5;
      particlesRef.current.push({
        x, y,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed,
        alpha: 1,
        color,
        size: 2 + Math.random() * 2,
        trail: [],
      });
    }
  }, []);

  useEffect(() => {
    if (!active) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const resize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };
    resize();
    window.addEventListener('resize', resize);

    const animate = (now: number) => {
      animRef.current = requestAnimationFrame(animate);
      ctx.fillStyle = 'rgba(0,0,0,0.15)';
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      // Launch new shell
      if (now - lastLaunchRef.current > 600 + Math.random() * 800) {
        lastLaunchRef.current = now;
        const x = canvas.width * 0.1 + Math.random() * canvas.width * 0.8;
        shellsRef.current.push({
          x,
          y: canvas.height,
          vy: -(8 + Math.random() * 5),
          targetY: canvas.height * 0.15 + Math.random() * canvas.height * 0.4,
          color: COLORS[Math.floor(Math.random() * COLORS.length)],
          exploded: false,
        });
      }

      // Update shells
      shellsRef.current = shellsRef.current.filter(s => {
        if (s.exploded) return false;
        s.y += s.vy;
        s.vy += 0.08;
        // Draw trail
        ctx.beginPath();
        ctx.arc(s.x, s.y, 2.5, 0, Math.PI * 2);
        ctx.fillStyle = s.color;
        ctx.globalAlpha = 0.9;
        ctx.fill();
        ctx.globalAlpha = 1;
        if (s.y <= s.targetY) {
          explode(s.x, s.y, s.color);
          s.exploded = true;
        }
        return !s.exploded;
      });

      // Update particles
      particlesRef.current = particlesRef.current.filter(p => {
        p.trail.push({ x: p.x, y: p.y });
        if (p.trail.length > 5) p.trail.shift();
        p.x += p.vx;
        p.y += p.vy;
        p.vy += 0.05;
        p.vx *= 0.98;
        p.alpha -= 0.018;

        // Draw trail
        for (let i = 0; i < p.trail.length; i++) {
          const t = p.trail[i];
          ctx.beginPath();
          ctx.arc(t.x, t.y, p.size * (i / p.trail.length) * 0.5, 0, Math.PI * 2);
          ctx.fillStyle = p.color;
          ctx.globalAlpha = p.alpha * (i / p.trail.length) * 0.4;
          ctx.fill();
        }

        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
        ctx.fillStyle = p.color;
        ctx.globalAlpha = p.alpha;
        ctx.fill();
        ctx.globalAlpha = 1;

        return p.alpha > 0;
      });
    };

    animRef.current = requestAnimationFrame(animate);
    return () => {
      cancelAnimationFrame(animRef.current);
      window.removeEventListener('resize', resize);
    };
  }, [active, explode]);

  if (!active) return null;
  return (
    <canvas
      ref={canvasRef}
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 9990,
        pointerEvents: 'none',
        opacity: 0.85,
      }}
    />
  );
}

export default FireworksCanvas;
