import React, { useEffect, useRef } from 'react';

interface WeatherAtmosphereProps {
  psi: number;
  uv: number;
  pm25: number;
  simulationMode?: 'live' | 'clear' | 'hazy' | 'severe_haze' | 'high_uv' | 'extreme_sun';
}

export const WeatherAtmosphere: React.FC<WeatherAtmosphereProps> = ({
  psi: actualPsi,
  uv: actualUv,
  pm25: actualPm25,
  simulationMode = 'live',
}) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  // Compute effective metrics based on simulation override
  let effectivePsi = actualPsi;
  let effectiveUv = actualUv;
  let effectivePm25 = actualPm25;

  if (simulationMode === 'clear') {
    effectivePsi = 28;
    effectiveUv = 2;
    effectivePm25 = 12;
  } else if (simulationMode === 'hazy') {
    effectivePsi = 145;
    effectiveUv = 3;
    effectivePm25 = 95;
  } else if (simulationMode === 'severe_haze') {
    effectivePsi = 280;
    effectiveUv = 1;
    effectivePm25 = 210;
  } else if (simulationMode === 'high_uv') {
    effectivePsi = 35;
    effectiveUv = 8;
    effectivePm25 = 18;
  } else if (simulationMode === 'extreme_sun') {
    effectivePsi = 40;
    effectiveUv = 12;
    effectivePm25 = 20;
  }

  const isHazy = effectivePsi > 100 || effectivePm25 > 55;
  const isSevereHaze = effectivePsi > 200 || effectivePm25 > 150;
  const isHighUv = effectiveUv >= 6;
  const isExtremeUv = effectiveUv >= 9;

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animationId: number;
    let width = (canvas.width = window.innerWidth);
    let height = (canvas.height = window.innerHeight);

    const handleResize = () => {
      if (!canvas) return;
      width = canvas.width = window.innerWidth;
      height = canvas.height = window.innerHeight;
    };

    window.addEventListener('resize', handleResize);

    // Particle system
    const particleCount = isSevereHaze ? 140 : isHazy ? 80 : isHighUv ? 35 : 20;
    interface Particle {
      x: number;
      y: number;
      size: number;
      vx: number;
      vy: number;
      opacity: number;
      color: string;
      baseAlpha: number;
      angle: number;
      angularSpeed: number;
    }

    const particles: Particle[] = [];

    for (let i = 0; i < particleCount; i++) {
      const isSmokeParticle = isHazy;
      particles.push({
        x: Math.random() * width,
        y: Math.random() * height,
        size: isSmokeParticle
          ? Math.random() * 3 + (isSevereHaze ? 2.5 : 1.5)
          : isHighUv
          ? Math.random() * 2 + 1
          : Math.random() * 1.5 + 0.5,
        vx: (Math.random() - 0.5) * (isSevereHaze ? 0.6 : 0.3) + 0.15,
        vy: (Math.random() - 0.5) * 0.2 - (isHazy ? 0.08 : 0.02),
        opacity: Math.random() * 0.7 + 0.3,
        baseAlpha: isSevereHaze ? 0.45 : isHazy ? 0.28 : isHighUv ? 0.35 : 0.15,
        color: isSevereHaze
          ? 'rgba(217, 119, 6, ' // amber/smoke
          : isHazy
          ? 'rgba(202, 138, 4, ' // murky yellow/gold
          : isHighUv
          ? 'rgba(251, 191, 36, ' // gold solar flecks
          : 'rgba(56, 189, 248, ', // clear cyan
        angle: Math.random() * Math.PI * 2,
        angularSpeed: (Math.random() - 0.5) * 0.02,
      });
    }

    let frame = 0;

    const render = () => {
      frame++;
      ctx.clearRect(0, 0, width, height);

      // 1. Draw High UV Sun Corona & Flare Rays
      if (isHighUv) {
        const sunX = width > 768 ? width * 0.82 : width * 0.75;
        const sunY = 120;
        const baseRadius = isExtremeUv ? 55 : 42;
        const pulse = Math.sin(frame * 0.04) * (isExtremeUv ? 8 : 4);
        const sunRadius = baseRadius + pulse;

        // Outer ambient solar glow
        const outerGlow = ctx.createRadialGradient(
          sunX,
          sunY,
          sunRadius * 0.2,
          sunX,
          sunY,
          isExtremeUv ? 380 : 260
        );
        outerGlow.addColorStop(0, isExtremeUv ? 'rgba(251, 146, 60, 0.45)' : 'rgba(245, 158, 11, 0.3)');
        outerGlow.addColorStop(0.4, isExtremeUv ? 'rgba(234, 88, 12, 0.2)' : 'rgba(251, 191, 36, 0.12)');
        outerGlow.addColorStop(1, 'rgba(245, 158, 11, 0)');
        ctx.fillStyle = outerGlow;
        ctx.beginPath();
        ctx.arc(sunX, sunY, isExtremeUv ? 380 : 260, 0, Math.PI * 2);
        ctx.fill();

        // Sun Corona Rays
        const numRays = isExtremeUv ? 16 : 12;
        const rayRotation = frame * 0.005;
        ctx.save();
        ctx.translate(sunX, sunY);
        ctx.rotate(rayRotation);

        for (let i = 0; i < numRays; i++) {
          const angle = (i * (Math.PI * 2)) / numRays;
          const rayLength = (isExtremeUv ? 160 : 110) + Math.sin(frame * 0.05 + i) * 15;
          const rayWidth = isExtremeUv ? 0.08 : 0.05;

          const rayGrad = ctx.createLinearGradient(0, 0, Math.cos(angle) * rayLength, Math.sin(angle) * rayLength);
          rayGrad.addColorStop(0, isExtremeUv ? 'rgba(254, 240, 138, 0.5)' : 'rgba(253, 224, 71, 0.35)');
          rayGrad.addColorStop(1, 'rgba(251, 146, 60, 0)');

          ctx.fillStyle = rayGrad;
          ctx.beginPath();
          ctx.moveTo(0, 0);
          ctx.arc(0, 0, rayLength, angle - rayWidth, angle + rayWidth);
          ctx.closePath();
          ctx.fill();
        }
        ctx.restore();

        // Core Glowing Sun Disc
        const sunCoreGrad = ctx.createRadialGradient(
          sunX - 6,
          sunY - 6,
          2,
          sunX,
          sunY,
          sunRadius
        );
        sunCoreGrad.addColorStop(0, '#ffffff');
        sunCoreGrad.addColorStop(0.35, '#fef08a');
        sunCoreGrad.addColorStop(0.7, '#f59e0b');
        sunCoreGrad.addColorStop(1, isExtremeUv ? '#dc2626' : '#ea580c');

        ctx.beginPath();
        ctx.arc(sunX, sunY, sunRadius, 0, Math.PI * 2);
        ctx.fillStyle = sunCoreGrad;
        ctx.shadowColor = isExtremeUv ? '#f97316' : '#fbbf24';
        ctx.shadowBlur = isExtremeUv ? 35 : 25;
        ctx.fill();
        ctx.shadowBlur = 0;
      }

      // 2. Draw Haze Fog & Atmospheric Smog
      if (isHazy) {
        // Volumetric hazy smoke banks
        const hazeIntensity = Math.min(1, effectivePsi / 280);
        
        // Drifting smog waves
        const wave1Y = Math.sin(frame * 0.01) * 30 + height * 0.35;
        const smogGrad1 = ctx.createRadialGradient(
          width * 0.5 + Math.cos(frame * 0.008) * 100,
          wave1Y,
          50,
          width * 0.5,
          wave1Y,
          width * 0.8
        );
        smogGrad1.addColorStop(
          0,
          isSevereHaze
            ? `rgba(180, 83, 9, ${0.18 * hazeIntensity})`
            : `rgba(161, 98, 7, ${0.12 * hazeIntensity})`
        );
        smogGrad1.addColorStop(1, 'rgba(15, 23, 42, 0)');
        ctx.fillStyle = smogGrad1;
        ctx.fillRect(0, 0, width, height);

        // Low ground haze blanket
        const groundGrad = ctx.createLinearGradient(0, height * 0.4, 0, height);
        groundGrad.addColorStop(0, 'rgba(15, 23, 42, 0)');
        groundGrad.addColorStop(
          1,
          isSevereHaze
            ? `rgba(120, 53, 15, ${0.28 * hazeIntensity})`
            : `rgba(113, 63, 18, ${0.15 * hazeIntensity})`
        );
        ctx.fillStyle = groundGrad;
        ctx.fillRect(0, 0, width, height);
      }

      // 3. Render Floating Particulates / Dust / Sun Motes
      for (let i = 0; i < particles.length; i++) {
        const p = particles[i];
        p.x += p.vx;
        p.y += p.vy;
        p.angle += p.angularSpeed;

        if (p.x < -20) p.x = width + 20;
        if (p.x > width + 20) p.x = -20;
        if (p.y < -20) p.y = height + 20;
        if (p.y > height + 20) p.y = -20;

        const dynamicAlpha = p.baseAlpha * (0.6 + 0.4 * Math.sin(p.angle + frame * 0.03));

        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
        ctx.fillStyle = `${p.color}${dynamicAlpha})`;
        ctx.fill();

        // Draw soft particle glow for larger haze or sun motes
        if (p.size > 2.2) {
          ctx.beginPath();
          ctx.arc(p.x, p.y, p.size * 2.2, 0, Math.PI * 2);
          ctx.fillStyle = `${p.color}${dynamicAlpha * 0.25})`;
          ctx.fill();
        }
      }

      animationId = requestAnimationFrame(render);
    };

    render();

    return () => {
      cancelAnimationFrame(animationId);
      window.removeEventListener('resize', handleResize);
    };
  }, [isHazy, isSevereHaze, isHighUv, isExtremeUv, effectivePsi, effectiveUv, effectivePm25]);

  // CSS Backdrop Theme based on Atmospheric Status
  let backgroundStyle = 'from-slate-950 via-slate-900 to-slate-950';

  if (isSevereHaze) {
    backgroundStyle = 'from-amber-950/40 via-stone-900/90 to-slate-950';
  } else if (isHazy) {
    backgroundStyle = 'from-yellow-950/25 via-slate-900/90 to-slate-950';
  } else if (isExtremeUv) {
    backgroundStyle = 'from-amber-950/30 via-slate-900/95 to-slate-950';
  } else if (isHighUv) {
    backgroundStyle = 'from-sky-950/30 via-slate-900/95 to-slate-950';
  }

  return (
    <div className="pointer-events-none fixed inset-0 overflow-hidden z-0 transition-colors duration-1000">
      {/* Dynamic atmospheric color gradient background */}
      <div className={`absolute inset-0 bg-gradient-to-b ${backgroundStyle} transition-all duration-1000`} />

      {/* Atmospheric Smog Tint for Haze */}
      {isHazy && (
        <div
          className={`absolute inset-0 transition-opacity duration-1000 ${
            isSevereHaze
              ? 'bg-amber-900/20 mix-blend-color-dodge backdrop-blur-[0.5px]'
              : 'bg-yellow-900/10 mix-blend-color-dodge'
          }`}
        />
      )}

      {/* Canvas for dynamic particles, solar flares, and smoke drift */}
      <canvas ref={canvasRef} className="absolute inset-0 w-full h-full" />
    </div>
  );
};
