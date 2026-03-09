import { useEffect, useRef, useCallback } from 'react';
import type { EmployerResult } from '../../types/matching.types';

interface EmberBrainProps {
  className?: string;
  employers?: EmployerResult[];
}

interface Node {
  // Home position (where the node wants to be)
  homeX: number;
  homeY: number;
  // Current position
  x: number;
  y: number;
  // Velocity
  vx: number;
  vy: number;
  // Data
  label: string;
  score: number;
  radius: number;
  pulseRadius: number;
  pulseTarget: number;
  // Ambient drift
  driftAngle: number;
  driftSpeed: number;
  driftRadius: number;
}

const REPEL_RADIUS = 100;  // px — cursor repulsion range
const REPEL_FORCE = 1.8;   // gentle push
const SPRING = 0.02;       // slow return home
const DAMPING = 0.92;      // high damping = smooth, no jitter
const EDGE_DIST_PX = 130;  // max px distance to draw an edge

/**
 * Ember Neural Core — organic force-directed network.
 * Nodes = employer matches, sized by score.
 * Hover to push nodes apart; they spring back when you move away.
 */
export function EmberBrain({ className, employers = [] }: EmberBrainProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const mouseRef = useRef({ x: -9999, y: -9999, active: false });
  const animRef = useRef<number>(0);
  const nodesRef = useRef<Node[]>([]);
  const lastPulseRef = useRef(0);

  const handleMouseMove = useCallback((e: React.MouseEvent<HTMLCanvasElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    mouseRef.current.x = e.clientX - rect.left;
    mouseRef.current.y = e.clientY - rect.top;
    mouseRef.current.active = true;
  }, []);

  const handleMouseLeave = useCallback(() => {
    mouseRef.current.active = false;
  }, []);

  // Build nodes whenever employers change
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const rect = canvas.getBoundingClientRect();
    const w = rect.width;
    const h = rect.height;
    if (w === 0 || h === 0) return;

    const sorted = [...employers].sort((a, b) => b.overallScore - a.overallScore);
    const count = Math.max(sorted.length, 40);
    const nodes: Node[] = [];

    // Distribute in a wide ellipse with natural clustering
    const cx = w / 2;
    const cy = h / 2;
    const spreadX = w * 0.4;
    const spreadY = h * 0.35;

    for (let i = 0; i < count; i++) {
      const emp = sorted[i % sorted.length];
      const score = emp ? emp.overallScore : 50 + Math.random() * 40;
      const baseR = 2 + (score / 100) * 4; // 2–6px

      // Organic distribution: golden-angle spiral with jitter
      const angle = i * 2.399963 + Math.random() * 0.5; // golden angle ≈ 137.5°
      const r = Math.sqrt((i + 0.5) / count); // uniform disk fill
      const jitterX = (Math.random() - 0.5) * 30;
      const jitterY = (Math.random() - 0.5) * 20;
      const homeX = cx + Math.cos(angle) * r * spreadX + jitterX;
      const homeY = cy + Math.sin(angle) * r * spreadY + jitterY;

      nodes.push({
        homeX,
        homeY,
        x: homeX,
        y: homeY,
        vx: 0,
        vy: 0,
        label: emp ? emp.companyName : '',
        score,
        radius: baseR,
        pulseRadius: baseR,
        pulseTarget: baseR,
        driftAngle: Math.random() * Math.PI * 2,
        driftSpeed: 0.003 + Math.random() * 0.005,
        driftRadius: 3 + Math.random() * 5,
      });
    }

    nodesRef.current = nodes;
  }, [employers]);

  // Animation loop
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    function animate(time: number) {
      const nodes = nodesRef.current;
      const dpr = window.devicePixelRatio || 1;
      const rect = canvas!.getBoundingClientRect();
      const w = rect.width;
      const h = rect.height;
      canvas!.width = w * dpr;
      canvas!.height = h * dpr;
      ctx!.setTransform(dpr, 0, 0, dpr, 0, 0);
      ctx!.clearRect(0, 0, w, h);

      if (nodes.length === 0) {
        animRef.current = requestAnimationFrame(animate);
        return;
      }

      const mouse = mouseRef.current;

      // Pulse random nodes periodically
      if (time - lastPulseRef.current > 2000) {
        lastPulseRef.current = time;
        for (let i = 0; i < 4; i++) {
          const idx = Math.floor(Math.random() * nodes.length);
          nodes[idx].pulseTarget = nodes[idx].radius * 2.2;
        }
      }

      // Physics step
      for (const node of nodes) {
        // Ambient drift — gentle floating
        node.driftAngle += node.driftSpeed;
        const driftX = Math.cos(node.driftAngle) * node.driftRadius;
        const driftY = Math.sin(node.driftAngle) * node.driftRadius;
        const targetX = node.homeX + driftX;
        const targetY = node.homeY + driftY;

        // Spring force back to home + drift
        node.vx += (targetX - node.x) * SPRING;
        node.vy += (targetY - node.y) * SPRING;

        // Cursor repulsion
        if (mouse.active) {
          const dx = node.x - mouse.x;
          const dy = node.y - mouse.y;
          const dist = Math.sqrt(dx * dx + dy * dy);
          if (dist < REPEL_RADIUS && dist > 0.1) {
            const force = (1 - dist / REPEL_RADIUS) * REPEL_FORCE;
            node.vx += (dx / dist) * force;
            node.vy += (dy / dist) * force;
          }
        }

        // Damping
        node.vx *= DAMPING;
        node.vy *= DAMPING;

        // Integrate
        node.x += node.vx;
        node.y += node.vy;

        // Pulse animation
        node.pulseRadius += (node.pulseTarget - node.pulseRadius) * 0.06;
        if (Math.abs(node.pulseRadius - node.pulseTarget) < 0.15 && node.pulseTarget > node.radius * 1.2) {
          node.pulseTarget = node.radius;
        }
      }

      // Draw edges
      for (let i = 0; i < nodes.length; i++) {
        for (let j = i + 1; j < nodes.length; j++) {
          const a = nodes[i];
          const b = nodes[j];
          const dx = a.x - b.x;
          const dy = a.y - b.y;
          const dist = Math.sqrt(dx * dx + dy * dy);
          if (dist < EDGE_DIST_PX) {
            const opacity = (1 - dist / EDGE_DIST_PX) * 0.45;
            ctx!.strokeStyle = `rgba(217, 119, 6, ${opacity})`;
            ctx!.lineWidth = 1;
            ctx!.beginPath();
            ctx!.moveTo(a.x, a.y);
            ctx!.lineTo(b.x, b.y);
            ctx!.stroke();
          }
        }
      }

      // Draw nodes
      for (const node of nodes) {
        const r = node.pulseRadius;

        // Glow for pulsing nodes
        if (node.pulseRadius > node.radius * 1.4) {
          const glowR = r * 3.5;
          const gradient = ctx!.createRadialGradient(node.x, node.y, r, node.x, node.y, glowR);
          gradient.addColorStop(0, 'rgba(217, 119, 6, 0.25)');
          gradient.addColorStop(1, 'rgba(217, 119, 6, 0)');
          ctx!.fillStyle = gradient;
          ctx!.beginPath();
          ctx!.arc(node.x, node.y, glowR, 0, Math.PI * 2);
          ctx!.fill();
        }

        // Node dot
        ctx!.fillStyle = 'rgba(217, 119, 6, 0.7)';
        ctx!.beginPath();
        ctx!.arc(node.x, node.y, Math.max(r, 1.5), 0, Math.PI * 2);
        ctx!.fill();
      }

      animRef.current = requestAnimationFrame(animate);
    }

    animRef.current = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(animRef.current);
  }, []);

  return (
    <div className={className} style={{ width: '100%', height: '100%', position: 'relative' }}>
      <canvas
        ref={canvasRef}
        style={{ width: '100%', height: '100%', display: 'block', cursor: 'default' }}
        onMouseMove={handleMouseMove}
        onMouseLeave={handleMouseLeave}
      />
      <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex items-center gap-2">
        <span
          className="w-1.5 h-1.5 rounded-full animate-pulse"
          style={{ backgroundColor: 'var(--color-accent)' }}
        />
        <span
          className="font-mono text-[10px] uppercase tracking-[0.25em]"
          style={{ color: 'var(--color-textMuted)' }}
        >
          Ember Neural Core
        </span>
      </div>
    </div>
  );
}
