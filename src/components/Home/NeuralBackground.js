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
    const speed = 0.4; // Slower speed
    const fadeOutDuration = 150; // Longer fade-out duration for increased time to live

    // Initialize lines
    for (let i = 0; i < lineCount; i++) {
      lines.push({
        x: Math.random() * width,
        y: -Math.random() * height,  // Start off-screen to avoid gaps
        length: Math.random() * height * 1.5,  // Longer lines for extended time to live
        speed: Math.random() * speed + 0.2,
        fading: false,
        fadeProgress: 0,
        glowBallActive: false,
      });
    }

    const animate = () => {
      ctx.fillStyle = '#1a1f2b'; // Navy dark grey background
      ctx.fillRect(0, 0, width, height);

      lines.forEach(line => {
        // Start fading with a small probability based on y position
        if (!line.fading && Math.random() < line.y / height * 0.01) {
          line.fading = true;
          line.glowBallActive = true; // Generate glowball when fading starts
        }

        if (line.fading) {
          line.fadeProgress += 1;
          if (line.fadeProgress >= fadeOutDuration) {
            // Reset line after fading out completely
            line.y = -line.length;
            line.x = Math.random() * width;
            line.fading = false;
            line.fadeProgress = 0;
            line.speed = Math.random() * speed + 0.2;
            line.glowBallActive = false;
          }
        } else {
          // Move line downward
          line.y += line.speed;
        }

        // Calculate opacity based on fade progress
        const alpha = line.fading
          ? Math.max(0, 1 - line.fadeProgress / fadeOutDuration)
          : 0.8;

        // Draw continuous line with fading
        ctx.strokeStyle = `rgba(72, 86, 119, ${alpha})`;
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.moveTo(line.x, line.y - line.length);
        ctx.lineTo(line.x, line.y);
        ctx.stroke();

        // Draw glowing ball when line starts terminating
        if (line.glowBallActive) {
          ctx.beginPath();
          ctx.arc(line.x, line.y, 6, 0, Math.PI * 2);
          ctx.fillStyle = `rgba(72, 86, 119, ${alpha})`;
          ctx.shadowColor = `rgba(72, 86, 119, ${alpha})`;
          ctx.shadowBlur = 20;
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
