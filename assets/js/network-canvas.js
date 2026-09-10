/**
 * E-GLOBAL S.A. - Enterprise Interactive Network Canvas
 * Visualizing real-time digital infrastructure, connectivity and secure data flow.
 */

(function () {
  'use strict';

  const canvas = document.getElementById('heroNetworkCanvas');
  if (!canvas) return;

  const ctx = canvas.getContext('2d');
  let animationFrameId;
  let width, height, dpr;
  let isVisible = true;

  // Configuration
  const NODE_COUNT = 38;
  const CONNECTION_DIST = 140;
  const MOUSE_DIST = 160;
  
  // Theme Colors matching E-GLOBAL brand
  const COLOR_NODE = '#38bdf8';
  const COLOR_NODE_ACCENT = '#2563eb';
  const COLOR_LINE = 'rgba(56, 189, 248, 0.18)';
  const COLOR_PACKET = '#00f2fe';

  const nodes = [];
  const packets = [];
  const mouse = { x: -1000, y: -1000, active: false };

  class Node {
    constructor() {
      this.reset();
    }

    reset() {
      this.x = Math.random() * width;
      this.y = Math.random() * height;
      this.vx = (Math.random() - 0.5) * 0.7;
      this.vy = (Math.random() - 0.5) * 0.7;
      this.radius = Math.random() * 2.2 + 2.0;
      this.isHub = Math.random() > 0.8;
      if (this.isHub) {
        this.radius += 2.0;
      }
      this.pulse = Math.random() * Math.PI * 2;
    }

    update() {
      this.x += this.vx;
      this.y += this.vy;

      // Gentle boundary bounce
      if (this.x < 10) { this.x = 10; this.vx *= -1; }
      if (this.x > width - 10) { this.x = width - 10; this.vx *= -1; }
      if (this.y < 10) { this.y = 10; this.vy *= -1; }
      if (this.y > height - 10) { this.y = height - 10; this.vy *= -1; }

      // Mouse subtle repulsion/attraction
      if (mouse.active) {
        const dx = mouse.x - this.x;
        const dy = mouse.y - this.y;
        const dist = Math.sqrt(dx * dx + dy * dy);
        if (dist < MOUSE_DIST && dist > 10) {
          const force = (MOUSE_DIST - dist) / MOUSE_DIST;
          this.x -= (dx / dist) * force * 1.5;
          this.y -= (dy / dist) * force * 1.5;
        }
      }

      this.pulse += 0.03;
    }

    draw() {
      ctx.beginPath();
      const currentRadius = this.isHub 
        ? this.radius + Math.sin(this.pulse) * 1.2 
        : this.radius;
      
      ctx.arc(this.x, this.y, currentRadius, 0, Math.PI * 2);
      ctx.fillStyle = this.isHub ? COLOR_NODE_ACCENT : COLOR_NODE;
      ctx.fill();

      // Hub outer glow
      if (this.isHub) {
        ctx.beginPath();
        ctx.arc(this.x, this.y, currentRadius + 5, 0, Math.PI * 2);
        ctx.strokeStyle = 'rgba(56, 189, 248, 0.35)';
        ctx.lineWidth = 1;
        ctx.stroke();
      }
    }
  }

  class Packet {
    constructor(nodeA, nodeB) {
      this.from = nodeA;
      this.to = nodeB;
      this.progress = 0;
      this.speed = Math.random() * 0.012 + 0.008;
      this.size = 2.5;
    }

    update() {
      this.progress += this.speed;
      return this.progress < 1;
    }

    draw() {
      const curX = this.from.x + (this.to.x - this.from.x) * this.progress;
      const curY = this.from.y + (this.to.y - this.from.y) * this.progress;

      ctx.beginPath();
      ctx.arc(curX, curY, this.size, 0, Math.PI * 2);
      ctx.fillStyle = COLOR_PACKET;
      ctx.shadowColor = COLOR_PACKET;
      ctx.shadowBlur = 8;
      ctx.fill();
      ctx.shadowBlur = 0; // reset
    }
  }

  function resize() {
    const rect = canvas.getBoundingClientRect();
    dpr = window.devicePixelRatio || 1;
    width = rect.width || 500;
    height = rect.height || 500;

    canvas.width = width * dpr;
    canvas.height = height * dpr;
    ctx.scale(dpr, dpr);

    if (nodes.length === 0) {
      for (let i = 0; i < NODE_COUNT; i++) {
        nodes.push(new Node());
      }
    }
  }

  function tick() {
    if (!isVisible) return;

    ctx.clearRect(0, 0, width, height);

    // Update and draw nodes
    for (let i = 0; i < nodes.length; i++) {
      nodes[i].update();
    }

    // Draw connections between nodes
    for (let i = 0; i < nodes.length; i++) {
      const nodeA = nodes[i];
      for (let j = i + 1; j < nodes.length; j++) {
        const nodeB = nodes[j];
        const dx = nodeA.x - nodeB.x;
        const dy = nodeA.y - nodeB.y;
        const dist = Math.sqrt(dx * dx + dy * dy);

        if (dist < CONNECTION_DIST) {
          const alpha = (1 - dist / CONNECTION_DIST) * 0.45;
          ctx.beginPath();
          ctx.moveTo(nodeA.x, nodeA.y);
          ctx.lineTo(nodeB.x, nodeB.y);
          ctx.strokeStyle = `rgba(56, 189, 248, ${alpha})`;
          ctx.lineWidth = 1;
          ctx.stroke();

          // Chance to spawn packet
          if (Math.random() < 0.003 && packets.length < 15) {
            packets.push(new Packet(nodeA, nodeB));
          }
        }
      }

      // Mouse connections
      if (mouse.active) {
        const mdx = nodeA.x - mouse.x;
        const mdy = nodeA.y - mouse.y;
        const mdist = Math.sqrt(mdx * mdx + mdy * mdy);
        if (mdist < MOUSE_DIST) {
          const alpha = (1 - mdist / MOUSE_DIST) * 0.5;
          ctx.beginPath();
          ctx.moveTo(nodeA.x, nodeA.y);
          ctx.lineTo(mouse.x, mouse.y);
          ctx.strokeStyle = `rgba(0, 242, 254, ${alpha})`;
          ctx.lineWidth = 1.2;
          ctx.stroke();
        }
      }

      nodeA.draw();
    }

    // Update & draw data packets
    for (let i = packets.length - 1; i >= 0; i--) {
      const p = packets[i];
      if (p.update()) {
        p.draw();
      } else {
        packets.splice(i, 1);
      }
    }

    animationFrameId = requestAnimationFrame(tick);
  }

  // Event Listeners
  window.addEventListener('resize', () => {
    resize();
  });

  canvas.addEventListener('mousemove', (e) => {
    const rect = canvas.getBoundingClientRect();
    mouse.x = e.clientX - rect.left;
    mouse.y = e.clientY - rect.top;
    mouse.active = true;
  });

  canvas.addEventListener('mouseleave', () => {
    mouse.active = false;
  });

  // Touch support for mobile devices
  canvas.addEventListener('touchmove', (e) => {
    if (e.touches.length > 0) {
      const rect = canvas.getBoundingClientRect();
      mouse.x = e.touches[0].clientX - rect.left;
      mouse.y = e.touches[0].clientY - rect.top;
      mouse.active = true;
    }
  }, { passive: true });

  canvas.addEventListener('touchend', () => {
    mouse.active = false;
  });

  // Pause when off-screen for performance
  if ('IntersectionObserver' in window) {
    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        isVisible = entry.isIntersecting;
        if (isVisible) {
          cancelAnimationFrame(animationFrameId);
          animationFrameId = requestAnimationFrame(tick);
        }
      });
    }, { threshold: 0.1 });
    observer.observe(canvas);
  }

  // Initialize
  resize();
  animationFrameId = requestAnimationFrame(tick);
})();
