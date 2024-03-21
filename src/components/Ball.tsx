export interface BallProps {
  x: number;
  y: number;
  radius: number;
  color: string;
  velocityX: number;
  velocityY: number;
  isDragging?: boolean;
}

export const drawBall = (
  ctx: CanvasRenderingContext2D,
  { x, y, radius, color }: BallProps
) => {
  ctx.beginPath();
  ctx.arc(x, y, radius, 0, Math.PI * 2);
  ctx.fillStyle = color;
  ctx.fill();
  ctx.closePath();
};

export const generateBalls = (
  count: number,
  width: number,
  height: number
): BallProps[] => {
  const balls: BallProps[] = [];
  const minRadius = 10; 
  const maxRadius = 30; 
  const attemptLimit = 1000; 

  for (let i = 0; i < count; i++) {
    let overlap;
    let attempts = 0;
    let newBall;

    do {
      overlap = false;
      const radius =
        Math.floor(Math.random() * (maxRadius - minRadius + 1)) + minRadius;
      newBall = {
        x: Math.random() * (width - radius * 2) + radius,
        y: Math.random() * (height - radius * 2) + radius,
        radius: radius,
        color: `rgb(${Math.random() * 255}, ${Math.random() * 255}, ${Math.random() * 255})`,
        velocityX: 0,
        velocityY: 0,
      };

      for (const ball of balls) {
        const dx = newBall.x - ball.x;
        const dy = newBall.y - ball.y;
        const distance = Math.sqrt(dx * dx + dy * dy);
        if (distance < newBall.radius + ball.radius) {
          overlap = true;
          break; 
        }
      }

      attempts++;
      if (attempts > attemptLimit) {
        throw new Error('Превышен лимит попыток расположения шаров');
      }
    } while (overlap); 

    balls.push(newBall);
  }

  return balls;
};
