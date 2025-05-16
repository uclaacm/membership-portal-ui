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

    const lines = [];
    const lineCount = 80;
    const speed = 2;

    // Initialize lines
    for (let i = 0; i < lineCount; i++) {
      lines.push({
        x: Math.random() * width,
        y: Math.random() * height,
        length: Math.random() * 100 + 50,
        speed: Math.random() * speed + 1,
        glowBallChance: Math.random() < 0.3,  // 30% chance of glow ball
      });
    }

    const animate = () => {
      ctx.fillStyle = '#1a1f2b'; // Navy dark grey background
      ctx.fillRect(0, 0, width, height);

      lines.forEach(line => {
        line.y += line.speed;
        if (line.y - line.length > height) {
          line.y = -line.length;
          line.x = Math.random() * width;
        }

        // Draw line
        ctx.strokeStyle = 'rgba(0, 255, 255, 0.8)';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.moveTo(line.x, line.y - line.length);
        ctx.lineTo(line.x, line.y);
        ctx.stroke();

        // Draw glowing ball at the end occasionally
        if (line.glowBallChance && line.y > 0) {
          ctx.beginPath();
          ctx.arc(line.x, line.y, 4, 0, Math.PI * 2);
          ctx.fillStyle = 'rgba(0, 255, 255, 0.8)';
          ctx.shadowColor = 'rgba(0, 255, 255, 0.5)';
          ctx.shadowBlur = 15;
          ctx.fill();
          ctx.shadowBlur = 0;
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
