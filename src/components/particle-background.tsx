
'use client'

import { useRef, useEffect } from 'react';

export function ParticleBackground() {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let width = (canvas.width = window.innerWidth);
    let height = (canvas.height = window.innerHeight);
    let particles: Particle[] = [];
    const particleCount = 100;
    const connectDistance = 120;
    const gridSpacing = 50;

    class Particle {
      x: number;
      y: number;
      vx: number;
      vy: number;
      size: number;
      isGridPoint: boolean;

      constructor(x?: number, y?: number, isGridPoint = false) {
        this.isGridPoint = isGridPoint;
        this.x = x ?? Math.random() * width;
        this.y = y ?? Math.random() * height;
        this.vx = (Math.random() - 0.5) * 0.5;
        this.vy = (Math.random() - 0.5) * 0.5;
        this.size = this.isGridPoint ? 1.5 : Math.random() * 2 + 1;
      }

      update() {
        if (!this.isGridPoint) {
            this.x += this.vx;
            this.y += this.vy;

            if (this.x < 0 || this.x > width) this.vx *= -1;
            if (this.y < 0 || this.y > height) this.vy *= -1;
        }
      }

      draw() {
        if (!ctx) return;
        ctx.fillStyle = this.isGridPoint ? 'hsla(180, 47.1%, 64.3%, 0.2)' : 'hsla(180, 100%, 25.1%, 0.5)';
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
        ctx.fill();
      }
    }

    function init() {
      particles = [];
      // Grid points
      for (let x = 0; x < width; x += gridSpacing) {
          for(let y = 0; y < height; y += gridSpacing) {
            particles.push(new Particle(x, y, true));
          }
      }
      // Floating particles
      for (let i = 0; i < particleCount; i++) {
        particles.push(new Particle());
      }
    }

    function connect() {
      if (!ctx) return;
      for (let i = 0; i < particles.length; i++) {
        for (let j = i; j < particles.length; j++) {
          const distance = Math.sqrt(
            Math.pow(particles[i].x - particles[j].x, 2) +
            Math.pow(particles[i].y - particles[j].y, 2)
          );

          if (distance < connectDistance) {
            const opacity = 1 - distance / connectDistance;
            ctx.strokeStyle = `hsla(180, 100%, 25.1%, ${opacity * 0.3})`;
            ctx.lineWidth = 1;
            ctx.beginPath();
            ctx.moveTo(particles[i].x, particles[i].y);
            ctx.lineTo(particles[j].x, particles[j].y);
            ctx.stroke();
          }
        }
      }
    }

    function animate() {
      if (!ctx) return;
      ctx.clearRect(0, 0, width, height);
      particles.forEach(p => {
        p.update();
        p.draw();
      });
      connect();
      requestAnimationFrame(animate);
    }

    function handleResize() {
        width = canvas.width = window.innerWidth;
        height = canvas.height = window.innerHeight;
        init();
    }
    
    window.addEventListener('resize', handleResize);

    init();
    animate();

    return () => {
        window.removeEventListener('resize', handleResize);
    }

  }, []);

  return <canvas ref={canvasRef} className="absolute top-0 left-0 w-full h-full z-0 opacity-20" />;
}

    