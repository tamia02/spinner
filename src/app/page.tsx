"use client";

import React, { useEffect, useRef } from "react";
import Link from "next/link";

export default function LandingPage() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let w: number;
    let h: number;
    let animationFrameId: number;

    const mouse = { x: -1000, y: -1000 };
    const handleMouseMove = (e: MouseEvent) => {
      const rect = canvas.getBoundingClientRect();
      mouse.x = e.clientX - rect.left;
      mouse.y = e.clientY - rect.top;
    };
    canvas.addEventListener('mousemove', handleMouseMove);
    canvas.addEventListener('mouseleave', () => { mouse.x = -1000; mouse.y = -1000; });

    const resize = () => {
      const parent = canvas.parentElement;
      if (parent) {
        w = canvas.width = parent.clientWidth;
        h = canvas.height = parent.clientHeight;

        // Ensure no old particles bug out when initializing
        initParticles();
      }
    };

    // Particle Structure
    const particles: { x: number; y: number; vx: number; vy: number; baseR: number; r: number }[] = [];
    const COUNT = 160;

    const initParticles = () => {
      particles.length = 0;
      for (let i = 0; i < COUNT; i++) {
        particles.push({
          x: Math.random() * w,
          y: Math.random() * h,
          vx: (Math.random() - 0.5) * 0.8,
          vy: (Math.random() - 0.5) * 0.8,
          baseR: Math.random() * 1.5 + 0.5,
          r: 0
        });
      }
    };

    resize();
    window.addEventListener("resize", resize);

    const draw = () => {
      ctx.clearRect(0, 0, w, h);

      particles.forEach((p, i) => {
        p.x += p.vx;
        p.y += p.vy;

        // Bounce off edges
        if (p.x < 0 || p.x > w) p.vx *= -1;
        if (p.y < 0 || p.y > h) p.vy *= -1;

        p.r = p.baseR;

        // Mouse connection
        const dx = mouse.x - p.x;
        const dy = mouse.y - p.y;
        const dist = Math.sqrt(dx * dx + dy * dy);

        if (dist < 180) {
          ctx.beginPath();
          ctx.strokeStyle = `rgba(17,17,17,${0.3 * (1 - dist / 180)})`;
          ctx.lineWidth = 1;
          ctx.moveTo(p.x, p.y);
          ctx.lineTo(mouse.x, mouse.y);
          ctx.stroke();
          p.r = p.baseR * 2.5;
        }

        // Draw node
        ctx.fillStyle = "rgba(17,17,17,0.9)";
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
        ctx.fill();

        // Connect nearby nodes
        for (let j = i + 1; j < particles.length; j++) {
          const p2 = particles[j];
          const dX2 = p.x - p2.x;
          const dY2 = p.y - p2.y;
          const dist2 = Math.sqrt(dX2 * dX2 + dY2 * dY2);

          if (dist2 < 85) {
            ctx.beginPath();
            ctx.strokeStyle = `rgba(17,17,17,${0.15 * (1 - dist2 / 85)})`;
            ctx.lineWidth = 0.5;
            ctx.moveTo(p.x, p.y);
            ctx.lineTo(p2.x, p2.y);
            ctx.stroke();
          }
        }
      });

      animationFrameId = requestAnimationFrame(draw);
    };

    draw();

    return () => {
      window.removeEventListener("resize", resize);
      canvas.removeEventListener('mousemove', handleMouseMove);
      cancelAnimationFrame(animationFrameId);
    };
  }, []);

  return (
    <div className="flex w-screen h-screen overflow-hidden bg-[#eef0f2] font-['Space_Grotesk'] text-[#111] relative">
      {/* Faint blueprint grid background */}
      <div
        className="absolute inset-0 opacity/35 pointer-events-none z-0"
        style={{
          backgroundImage: `linear-gradient(90deg, rgba(0,0,0,0.04) 1px, transparent 1px), linear-gradient(0deg, rgba(0,0,0,0.04) 1px, transparent 1px)`,
          backgroundSize: '40px 40px'
        }}
      />

      {/* Navigation */}
      <nav className="absolute top-0 left-0 w-full flex items-center justify-between py-5 px-10 font-['IBM_Plex_Mono'] text-xs z-20">
        <div className="w-[22px] h-[22px] border-2 border-[#111] rotate-45" />

        <div className="hidden md:flex gap-8">
          <span className="opacity-70">// Core</span>
          <span className="opacity-70">// Synapse</span>
          <span className="opacity-70">// Topology</span>
        </div>

        <div className="flex items-center gap-4">
          <span>v EN</span>
          <Link href="/setup">
            <button className="bg-[#111] text-white px-4 py-2 border-none text-[11px] font-['IBM_Plex_Mono'] cursor-pointer hover:bg-black/80 transition-colors z-30 relative relative">
              Initialize
            </button>
          </Link>
        </div>
      </nav>

      {/* Main Container */}
      <div className="flex w-full h-full relative z-10 flex-col md:flex-row pointer-events-none">

        {/* Left Side (Content) */}
        <div className="w-full md:w-1/2 h-full relative p-8 md:p-0 pointer-events-auto">
          <div className="absolute top-1/2 md:translate-y-[-50%] left-8 md:left-[70px] max-w-[540px]">
            <div className="font-['IBM_Plex_Mono'] text-[11px] tracking-[3px] mb-5 uppercase">
               // Generate Once, Publish Everywhere
            </div>

            <h1 className="text-5xl md:text-[64px] leading-[1.1] m-0 font-bold">
              One piece of content.<br />
              <span className="font-light">Every platform. Instantly.</span>
            </h1>

            <div className="font-['IBM_Plex_Mono'] mt-6 leading-[1.6] opacity-70 text-[13px]">
              Quantum-grade neural syndication architecture enabling zero-latency content propagation across multi-dimensional social networks. Autonomous neural bridges synchronize narrative state across platforms with sub-millisecond propagation.
            </div>

            <div className="flex gap-4 mt-8">
              <Link href="/setup">
                <button className="px-7 py-3.5 text-[13px] font-['IBM_Plex_Mono'] relative cursor-pointer backdrop-blur-md bg-white/40 border border-black/20 group hover:bg-white/60 transition pointer-events-auto">
                  <span className="absolute -left-1.5 -top-1.5 w-2.5 h-2.5 border border-[#111] border-r-0 border-b-0" />
                  <span className="absolute -right-1.5 -bottom-1.5 w-2.5 h-2.5 border border-[#111] border-l-0 border-t-0" />
                  Sign in
                </button>
              </Link>

              <button className="px-7 py-3.5 text-[13px] font-['IBM_Plex_Mono'] cursor-pointer bg-[#111] text-white hover:bg-black/80 transition pointer-events-auto">
                Learn more
              </button>
            </div>
          </div>

          <div className="hidden lg:flex absolute bottom-10 left-[70px] gap-5">
            <div className="w-[120px] p-[18px] backdrop-blur-md bg-white/40 border border-black/15 font-['IBM_Plex_Mono'] relative">
              <span className="absolute -left-1.5 -top-1.5 w-2.5 h-2.5 border border-[#111] border-r-0 border-b-0" />
              <span className="absolute -right-1.5 -bottom-1.5 w-2.5 h-2.5 border border-[#111] border-l-0 border-t-0" />
              <strong className="block text-[20px] font-['Space_Grotesk'] font-bold mb-1">128Q</strong>
              <small className="text-[10px] tracking-[2px]">QUBITS</small>
            </div>
            <div className="w-[120px] p-[18px] backdrop-blur-md bg-white/40 border border-black/15 font-['IBM_Plex_Mono'] relative">
              <span className="absolute -left-1.5 -top-1.5 w-2.5 h-2.5 border border-[#111] border-r-0 border-b-0" />
              <span className="absolute -right-1.5 -bottom-1.5 w-2.5 h-2.5 border border-[#111] border-l-0 border-t-0" />
              <strong className="block text-[20px] font-['Space_Grotesk'] font-bold mb-1">0.01ms</strong>
              <small className="text-[10px] tracking-[2px]">LATENCY</small>
            </div>
            <div className="w-[120px] p-[18px] backdrop-blur-md bg-white/40 border border-black/15 font-['IBM_Plex_Mono'] relative">
              <span className="absolute -left-1.5 -top-1.5 w-2.5 h-2.5 border border-[#111] border-r-0 border-b-0" />
              <span className="absolute -right-1.5 -bottom-1.5 w-2.5 h-2.5 border border-[#111] border-l-0 border-t-0" />
              <strong className="block text-[20px] font-['Space_Grotesk'] font-bold mb-1">92%</strong>
              <small className="text-[10px] tracking-[2px]">ENTANGLEMENT</small>
            </div>
            <div className="w-[120px] p-[18px] backdrop-blur-md bg-white/40 border border-black/15 font-['IBM_Plex_Mono'] relative">
              <span className="absolute -left-1.5 -top-1.5 w-2.5 h-2.5 border border-[#111] border-r-0 border-b-0" />
              <span className="absolute -right-1.5 -bottom-1.5 w-2.5 h-2.5 border border-[#111] border-l-0 border-t-0" />
              <strong className="block text-[20px] font-['Space_Grotesk'] font-bold mb-1">4.8PB</strong>
              <small className="text-[10px] tracking-[2px]">DATA FLOW</small>
            </div>
          </div>
        </div>

        {/* Right Side (Canvas & HUD) */}
        <div className="w-full md:w-1/2 h-full relative hidden md:block">
          <canvas ref={canvasRef} className="absolute inset-0" />

          <div className="absolute top-[120px] left-[120px] font-['IBM_Plex_Mono'] text-[11px] backdrop-blur-md bg-white/40 px-2.5 py-1.5 border border-black/20">
            Cryo-State: 15mK
          </div>
          <div className="absolute top-[300px] right-[140px] font-['IBM_Plex_Mono'] text-[11px] backdrop-blur-md bg-white/40 px-2.5 py-1.5 border border-black/20">
            Entanglement Ratio
          </div>
          <div className="absolute bottom-[200px] left-[180px] font-['IBM_Plex_Mono'] text-[11px] backdrop-blur-md bg-white/40 px-2.5 py-1.5 border border-black/20">
            Neural Flux
          </div>
          <div className="absolute bottom-[120px] right-[180px] font-['IBM_Plex_Mono'] text-[11px] backdrop-blur-md bg-white/40 px-2.5 py-1.5 border border-black/20">
            Quantum Sync
          </div>
        </div>

      </div>
    </div>
  );
}
