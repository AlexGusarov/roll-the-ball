import React, { useState, useRef, useEffect } from 'react';
import { BallProps, drawBall, generateBalls } from './Ball';
import ColorSelector from './ColorSelector';
import './Table.css';

interface TableProps {
  width: number;
  height: number;
}

const Table: React.FC<TableProps> = ({ width, height }) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [balls, setBalls] = useState<BallProps[]>([]);

  const [dragging, setDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const [dragEnd, setDragEnd] = useState({ x: 0, y: 0 });
  const [ballSelected, setBallSelected] = useState(false);

  const [colorSelectorVisible, setColorSelectorVisible] = useState(false);
  const [selectedBallId, setSelectedBallId] = useState<number | null>(null);
  

  useEffect(() => {
    setBalls(generateBalls(10, width, height));
  }, [width, height]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const mouseDownHandler = (e: MouseEvent) => {
      const rect = canvas.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;
      let ballClicked = false;

      setBalls((balls) =>
        balls.map((ball, index) => {
          const distance = Math.sqrt((x - ball.x) ** 2 + (y - ball.y) ** 2);
          if (distance < ball.radius) {
            ballClicked = true;
            setSelectedBallId(index);
            setBallSelected(true); 
            return { ...ball, isDragging: true };
          }
          return ball;
        })
      );

      if (!ballClicked) {
        setDragging(true);
        setDragStart({ x, y });
        setDragEnd({ x, y });
      }
    };

    const mouseMoveHandler = (e: MouseEvent) => {
      if (!dragging) return;
      setBallSelected(false);
      const rect = canvas.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;
      setDragEnd({ x, y });
    };

    const mouseUpHandler = (e: MouseEvent) => {
      const rect = canvas.getBoundingClientRect();
      const mouseUpX = e.clientX - rect.left;
      const mouseUpY = e.clientY - rect.top;

      const movementDetected =
        dragStart.x !== mouseUpX || dragStart.y !== mouseUpY;

      setBalls((balls) =>
        balls.map((ball) => {
          if (ball.isDragging) {
            const dx = mouseUpX - ball.x;
            const dy = mouseUpY - ball.y;

            return {
              ...ball,
              isDragging: false,
              velocityX: dx / 10,
              velocityY: dy / 10,
            };
          }
          return ball;
        })
      );

      if (!movementDetected && ballSelected) {
        balls.forEach((ball, index) => {
          const distance = Math.sqrt(
            (mouseUpX - ball.x) ** 2 + (mouseUpY - ball.y) ** 2
          );
          if (distance < ball.radius) {
            setSelectedBallId(index);
            setColorSelectorVisible(true);
          }
        });
      }

      setDragging(false);
      setBallSelected(false);
    };

    canvas.addEventListener('mousedown', mouseDownHandler);
    canvas.addEventListener('mousemove', mouseMoveHandler);
    canvas.addEventListener('mouseup', mouseUpHandler);
    window.addEventListener('mouseup', mouseUpHandler);

    return () => {
      canvas.removeEventListener('mousedown', mouseDownHandler);
      canvas.removeEventListener('mousemove', mouseMoveHandler);
      canvas.removeEventListener('mouseup', mouseUpHandler);
      window.removeEventListener('mouseup', mouseUpHandler);
    };
  }, [dragging, ballSelected, balls, dragStart.x, dragStart.y]);

  useEffect(() => {
    const render = () => {
      const canvas = canvasRef.current;
      const ctx = canvas?.getContext('2d');
      if (!ctx) return;

      ctx.clearRect(0, 0, width, height);
      ctx.fillStyle = '#113C5B';
      ctx.fillRect(0, 0, width, height);

      if (
        dragging &&
        (dragStart.x !== dragEnd.x || dragStart.y !== dragEnd.y)
      ) {
        ctx.beginPath();
        ctx.moveTo(dragStart.x, dragStart.y);
        ctx.lineTo(dragEnd.x, dragEnd.y);
        ctx.strokeStyle = 'rgba(255, 255, 255, 0.7)';
        ctx.lineWidth = 2;
        ctx.stroke();

        const arrowSize = 20;
        const angle = Math.atan2(
          dragEnd.y - dragStart.y,
          dragEnd.x - dragStart.x
        );

        ctx.beginPath();
        ctx.moveTo(dragEnd.x, dragEnd.y);
        ctx.lineTo(
          dragEnd.x - arrowSize * Math.cos(angle - Math.PI / 7),
          dragEnd.y - arrowSize * Math.sin(angle - Math.PI / 7)
        );
        ctx.lineTo(
          dragEnd.x - arrowSize * Math.cos(angle + Math.PI / 7),
          dragEnd.y - arrowSize * Math.sin(angle + Math.PI / 7)
        );
        ctx.lineTo(dragEnd.x, dragEnd.y);
        ctx.lineTo(
          dragEnd.x - arrowSize * Math.cos(angle - Math.PI / 7),
          dragEnd.y - arrowSize * Math.sin(angle - Math.PI / 7)
        );
        ctx.fillStyle = 'red';
        ctx.fill();
      }

      setBalls((prevBalls) => {
        let updatedBalls = prevBalls.map((ball) => ({ ...ball }));

        const friction = 0.99;

        updatedBalls.forEach((ball) => {
          ball.velocityX *= friction;
          ball.velocityY *= friction;

          ball.x += ball.velocityX;
          ball.y += ball.velocityY;

          if (ball.x - ball.radius <= 0) {
            ball.velocityX *= -0.9;
            ball.x = ball.radius;
          } else if (ball.x + ball.radius >= width) {
            ball.velocityX *= -0.9;
            ball.x = width - ball.radius;
          }

          if (ball.y - ball.radius <= 0) {
            ball.velocityY *= -0.9;
            ball.y = ball.radius;
          } else if (ball.y + ball.radius >= height) {
            ball.velocityY *= -0.9;
            ball.y = height - ball.radius;
          }
        });

        for (let i = 0; i < updatedBalls.length; i++) {
          for (let j = i + 1; j < updatedBalls.length; j++) {
            const dx = updatedBalls[j].x - updatedBalls[i].x;
            const dy = updatedBalls[j].y - updatedBalls[i].y;
            const distance = Math.sqrt(dx * dx + dy * dy);
            const overlap =
              updatedBalls[i].radius + updatedBalls[j].radius - distance;
            if (distance < updatedBalls[i].radius + updatedBalls[j].radius) {
              const nx = dx / distance;
              const ny = dy / distance;

              updatedBalls[i].x -= (nx * overlap) / 2;
              updatedBalls[i].y -= (ny * overlap) / 2;
              updatedBalls[j].x += (nx * overlap) / 2;
              updatedBalls[j].y += (ny * overlap) / 2;

              const vx1 = updatedBalls[i].velocityX - updatedBalls[j].velocityX;
              const vy1 = updatedBalls[i].velocityY - updatedBalls[j].velocityY;
              const dotProduct = vx1 * nx + vy1 * ny;

              if (dotProduct > 0) {
                const collisionScale = dotProduct / distance;
                const collisionX = nx * collisionScale;
                const collisionY = ny * collisionScale;

                updatedBalls[i].velocityX -= collisionX;
                updatedBalls[i].velocityY -= collisionY;
                updatedBalls[j].velocityX += collisionX;
                updatedBalls[j].velocityY += collisionY;
              }
            }
          }
        }

        return updatedBalls;
      });

      balls.forEach((ball) => drawBall(ctx, ball));
    };

    const animationFrameId = requestAnimationFrame(render);

    return () => cancelAnimationFrame(animationFrameId);
  }, [dragging, dragStart, dragEnd, balls, width, height]);

  return (
    <>
      <canvas
        className="canvas"
        ref={canvasRef}
        width={width}
        height={height}
      ></canvas>
      {colorSelectorVisible && selectedBallId !== null && (
        <ColorSelector
          onChange={(newColor) => {
            setBalls((currentBalls) =>
              currentBalls.map((ball, index) =>
                index === selectedBallId ? { ...ball, color: newColor } : ball
              )
            );
            setColorSelectorVisible(false);
          }}
          onClose={() => setColorSelectorVisible(false)}
        />
      )}
    </>
  );
};

export default Table;
