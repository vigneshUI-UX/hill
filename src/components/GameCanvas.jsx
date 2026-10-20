import React, { useEffect, useRef } from 'react';

export default function GameCanvas({ onUpdateStats, isGameOver, setIsGameOver, setFailureReason }) {
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;

    let car = {
      x: 100,
      y: 300,
      vx: 0,
      vy: 0,
      angle: 0,
      vAngle: 0,
      width: 70,
      height: 30,
      wheels: [
        { offsetX: -25, offsetY: 12, radius: 15, rot: 0 },
        { offsetX: 25, offsetY: 12, radius: 15, rot: 0 }
      ]
    };

    let crates = [
      { x: 450, y: 220, vx: 0, vy: 0, width: 35, height: 35 },
      { x: 920, y: 180, vx: 0, vy: 0, width: 35, height: 35 },
      { x: 1350, y: 200, vx: 0, vy: 0, width: 35, height: 35 }
    ];

    let cameraX = 0;
    let keys = { ArrowRight: false, ArrowLeft: false, ArrowUp: false, ArrowDown: false, Space: false };

    let isAirborne = false;

    const carBodySVG = new Path2D("M -35,0 L -35,-12 Q -35,-16 -30,-18 L -15,-20 L -5,-32 Q -2,-35 5,-35 L 20,-35 Q 28,-35 32,-22 L 38,-15 Q 42,-12 42,-5 L 42,0 Z");
    const windowSVG = new Path2D("M -3,-18 L -2,-30 Q 3,-32 18,-32 L 28,-20 Q 25,-18 18,-18 Z");
    const spoilerSVG = new Path2D("M -38,-18 L -28,-18 L -26,-28 L -38,-28 Z");
    const wheelRimSVG = new Path2D("M 0,-10 L 0,10 M -10,0 L 10,0 M -7,-7 L 7,7 M -7,7 L 7,-7");

    // Continuous terrain function without bridge gaps
    const getTerrainHeight = (x) => {
      return (
        canvas.height * 0.68 +
        Math.sin(x * 0.002) * 85 +
        Math.cos(x * 0.0008) * 50
      );
    };

    const handleKeyDown = (e) => {
      if (e.code === 'ArrowRight' || e.key === 'd') keys.ArrowRight = true;
      if (e.code === 'ArrowLeft' || e.key === 'a') keys.ArrowLeft = true;
      if (e.code === 'ArrowUp' || e.key === 'w') {
        keys.ArrowUp = true;
        car.vy -= 8;
        car.vAngle += 0.08;
      }
      if (e.code === 'ArrowDown' || e.key === 's') keys.ArrowDown = true;
      if (e.code === 'Space') {
        keys.Space = true;
        if (isGameOver) {
          window.location.reload();
        }
      }
    };

    const handleKeyUp = (e) => {
      if (e.code === 'ArrowRight' || e.key === 'd') keys.ArrowRight = false;
      if (e.code === 'ArrowLeft' || e.key === 'a') keys.ArrowLeft = false;
      if (e.code === 'ArrowUp' || e.key === 'w') keys.ArrowUp = false;
      if (e.code === 'ArrowDown' || e.key === 's') keys.ArrowDown = false;
      if (e.code === 'Space') keys.Space = false;
    };

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);

    let animationFrameId;
    const updateGame = () => {
      if (!isGameOver) {
        car.vy += 0.38;

        if (keys.ArrowRight) {
          car.vx += 0.18;
          car.wheels[0].rot += 0.2;
          car.wheels[1].rot += 0.2;
        }
        if (keys.ArrowLeft) car.vx -= 0.12;

        if (keys.Space) car.vx *= 0.90;

        car.x += car.vx;
        car.y += car.vy;
        car.angle += car.vAngle;

        car.vx *= 0.99;
        car.vAngle *= 0.92;

        let touchingGround = false;

        car.wheels.forEach((wheel) => {
          const wx = car.x + wheel.offsetX * Math.cos(car.angle) - wheel.offsetY * Math.sin(car.angle);
          const wy = car.y + wheel.offsetX * Math.sin(car.angle) + wheel.offsetY * Math.cos(car.angle);

          const groundY = getTerrainHeight(wx);

          if (wy + wheel.radius >= groundY) {
            touchingGround = true;
            car.y -= (wy + wheel.radius - groundY);
            car.vy *= -0.15;
            car.vx *= 0.96;
          }
        });

        if (!touchingGround) {
          isAirborne = true;
        } else {
          if (isAirborne) {
            isAirborne = false;
            if (Math.abs(car.angle) > 1.0) {
              setIsGameOver(true);
              setFailureReason("Accident Detected! Car landed on the opposite side.");
            } else {
              car.angle = 0; 
              car.vAngle = 0;
            }
          }
        }

        if (Math.abs(car.angle) > 2.0) {
          setIsGameOver(true);
          setFailureReason("Accident Detected! Car flipped over.");
        }

        if (car.y > canvas.height + 50) {
          setIsGameOver(true);
          setFailureReason("Accident Detected! Car fell down into an abyss.");
        }

        crates.forEach((crate) => {
          crate.vy += 0.38;
          crate.x += crate.vx;
          crate.y += crate.vy;

          const crateGroundY = getTerrainHeight(crate.x);
          if (crate.y + crate.height / 2 >= crateGroundY) {
            crate.y = crateGroundY - crate.height / 2;
            crate.vy *= -0.2;
            crate.vx *= 0.85;
          }

          const dx = crate.x - car.x;
          const dy = crate.y - car.y;
          if (Math.hypot(dx, dy) < 48) {
            car.vx *= 0.4;
            crate.vx += car.vx * 0.8;
            crate.vy -= 1.5;
          }
        });

        onUpdateStats({
          distance: Math.max(0, (car.x - 100) / 10),
          speed: Math.abs(car.vx) * 3.6
        });
      }

      cameraX = car.x - canvas.width * 0.3;

      ctx.clearRect(0, 0, canvas.width, canvas.height);

      let skyGrad = ctx.createLinearGradient(0, 0, 0, canvas.height);
      skyGrad.addColorStop(0, '#5bc0de');
      skyGrad.addColorStop(1, '#ffffff');
      ctx.fillStyle = skyGrad;
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      ctx.fillStyle = '#f1c40f';
      ctx.beginPath();
      ctx.arc(canvas.width * 0.85, canvas.height * 0.25, 45, 0, Math.PI * 2);
      ctx.fill();

      // Background Mountains
      ctx.fillStyle = '#4c7a6e';
      ctx.beginPath();
      ctx.moveTo(0, canvas.height);
      for (let i = 0; i < canvas.width + 200; i += 100) {
        let mX = i + (cameraX * 0.3) % 100;
        let mY = canvas.height * 0.5 - Math.sin(i * 0.01) * 100;
        ctx.lineTo(mX, mY);
      }
      ctx.lineTo(canvas.width, canvas.height);
      ctx.fill();

      ctx.save();
      ctx.translate(-cameraX, 0);

      // Fully Solid Continuous Green Hills Fill
      ctx.fillStyle = '#558022';
      ctx.beginPath();
      ctx.moveTo(cameraX - 100, canvas.height + 100);
      ctx.lineTo(cameraX - 100, getTerrainHeight(cameraX - 100));
      
      for (let x = cameraX - 100; x <= cameraX + canvas.width + 100; x += 15) {
        let y = getTerrainHeight(x);
        ctx.lineTo(x, y);
      }
      ctx.lineTo(cameraX + canvas.width + 100, canvas.height + 100);
      ctx.closePath();
      ctx.fill();

      // Continuous Road Surface
      ctx.strokeStyle = '#2c3e50';
      ctx.lineWidth = 14;
      ctx.beginPath();
      let roadStarted = false;
      for (let x = cameraX - 100; x < cameraX + canvas.width + 100; x += 10) {
        let y = getTerrainHeight(x);
        if (!roadStarted) { ctx.moveTo(x, y); roadStarted = true; }
        else { ctx.lineTo(x, y); }
      }
      ctx.stroke();

      // Center Yellow Stripe
      ctx.strokeStyle = '#f1c40f';
      ctx.lineWidth = 3;
      ctx.setLineDash([15, 15]);
      ctx.beginPath();
      roadStarted = false;
      for (let x = cameraX - 100; x < cameraX + canvas.width + 100; x += 10) {
        let y = getTerrainHeight(x);
        if (!roadStarted) { ctx.moveTo(x, y); roadStarted = true; }
        else { ctx.lineTo(x, y); }
      }
      ctx.stroke();
      ctx.setLineDash([]);

      crates.forEach((crate) => {
        ctx.save();
        ctx.translate(crate.x, crate.y);
        ctx.fillStyle = '#a0522d';
        ctx.fillRect(-crate.width / 2, -crate.height / 2, crate.width, crate.height);
        ctx.strokeStyle = '#5c3a21';
        ctx.lineWidth = 2;
        ctx.strokeRect(-crate.width / 2, -crate.height / 2, crate.width, crate.height);
        ctx.beginPath();
        ctx.moveTo(-crate.width / 2, -crate.height / 2);
        ctx.lineTo(crate.width / 2, crate.height / 2);
        ctx.moveTo(crate.width / 2, -crate.height / 2);
        ctx.lineTo(-crate.width / 2, crate.height / 2);
        ctx.stroke();
        ctx.restore();
      });

      ctx.save();
      ctx.translate(car.x, car.y);
      ctx.rotate(car.angle);

      ctx.fillStyle = '#1a5276';
      ctx.fill(spoilerSVG);

      ctx.fillStyle = '#2980b9';
      ctx.fill(carBodySVG);
      ctx.strokeStyle = '#1b4f72';
      ctx.lineWidth = 2;
      ctx.stroke(carBodySVG);

      ctx.fillStyle = '#aed6f1';
      ctx.fill(windowSVG);

      ctx.fillStyle = '#f1c40f';
      ctx.beginPath();
      ctx.arc(38, -8, 4, 0, Math.PI * 2);
      ctx.fill();

      ctx.restore();

      car.wheels.forEach((wheel) => {
        const wx = car.x + wheel.offsetX * Math.cos(car.angle) - wheel.offsetY * Math.sin(car.angle);
        const wy = car.y + wheel.offsetX * Math.sin(car.angle) + wheel.offsetY * Math.cos(car.angle);

        ctx.save();
        ctx.translate(wx, wy);
        ctx.rotate(wheel.rot);

        ctx.fillStyle = '#222';
        ctx.beginPath();
        ctx.arc(0, 0, wheel.radius, 0, Math.PI * 2);
        ctx.fill();

        ctx.strokeStyle = '#444';
        ctx.lineWidth = 3;
        ctx.stroke();

        ctx.fillStyle = '#bdc3c7';
        ctx.beginPath();
        ctx.arc(0, 0, 8, 0, Math.PI * 2);
        ctx.fill();

        ctx.strokeStyle = '#2c3e50';
        ctx.lineWidth = 2;
        ctx.stroke(wheelRimSVG);

        ctx.restore();
      });

      ctx.restore();

      animationFrameId = requestAnimationFrame(updateGame);
    };

    animationFrameId = requestAnimationFrame(updateGame);

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
      cancelAnimationFrame(animationFrameId);
    };
  }, [isGameOver, onUpdateStats, setIsGameOver, setFailureReason]);

  return <canvas ref={canvasRef} />;
}