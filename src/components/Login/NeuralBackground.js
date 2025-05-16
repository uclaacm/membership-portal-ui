import React, { useEffect, useRef } from 'react';

const NeuralBackground = () => {
  const canvasRef = useRef();

  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    const width = window.innerWidth;
    const height = window.innerHeight;
    canvas.width = width;
    canvas.height = height;

    const nodes = [];
    const nodeCount = 60;
    const maxLineLength = 200;
    const speed = 0.5;

    // Initialize nodes
    for (let i = 0; i < nodeCount; i++) {
      nodes.push({
        x: Math.random() * width,
        y: Math.random() * height,
        vx: (Math.random() - 0.5) * speed,
        vy: (Math.random() - 0.5) * speed,
      });
    }

    const animate = () => {
      ctx.fillStyle = '#1a1f2b'; // Navy dark grey background
      ctx.fillRect(0, 0, width, height);

      nodes.forEach((node, i) => {
        node.x += node.vx;
        node.y += node.vy;

        // Bounce off edges
        if (node.x < 0 || node.x > width) node.vx *= -1;
        if (node.y < 0 || node.y > height) node.vy *= -1;

        // Draw node
        ctx.beginPath();
        ctx.arc(node.x, node.y, 2, 0, Math.PI * 2);
        ctx.fillStyle = '#ffffff';
        ctx.fill();

        // Connect to nearby nodes
        for (let j = i + 1; j < nodeCount; j++) {
          const otherNode = nodes[j];
          const dx = otherNode.x - node.x;
          const dy = otherNode.y - node.y;
          const distance = Math.sqrt(dx * dx + dy * dy);

          if (distance < maxLineLength) {
            ctx.strokeStyle = `rgba(255, 255, 255, ${1 - distance / maxLineLength})`;
            ctx.lineWidth = 0.5;
            ctx.beginPath();
            ctx.moveTo(node.x, node.y);
            ctx.lineTo(otherNode.x, otherNode.y);
            ctx.stroke();
          }
        }
      });

      requestAnimationFrame(animate);
    };

    animate();

    // Cleanup on unmount
    return () => cancelAnimationFrame(animate);
  }, []);

  return <canvas ref={canvasRef} className="fixed inset-0" />;
};

export default NeuralBackground;
