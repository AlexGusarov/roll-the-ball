import React, { useState, useRef, useEffect } from 'react';
import { BallProps, drawBall, generateBalls } from './Ball';
import './Table.css';

interface TableProps {
    width: number;
    height: number;
}

const Table: React.FC<TableProps> = ({ width, height }) => {
    const canvasRef = useRef<HTMLCanvasElement | null>(null);
    const [balls, setBalls] = useState<BallProps[]>([]);

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
            setBalls(balls => balls.map(ball => {
                const distance = Math.sqrt((x - ball.x) ** 2 + (y - ball.y) ** 2);
                if (distance < ball.radius) {
                    return { ...ball, isDragging: true };
                }
                return ball;
            }));
        };

        const mouseUpHandler = (e: MouseEvent) => {
            setBalls(balls => balls.map(ball => {
                if (ball.isDragging) {
                    const rect = canvas.getBoundingClientRect();
                    const x = e.clientX - rect.left;
                    const y = e.clientY - rect.top;
                    const dx = x - ball.x;
                    const dy = y - ball.y;
                    return { ...ball, isDragging: false, velocityX: dx / 10, velocityY: dy / 10 };
                }
                return ball;
            }));
        };

        canvas.addEventListener('mousedown', mouseDownHandler);
        canvas.addEventListener('mouseup', mouseUpHandler);

        return () => {
            canvas.removeEventListener('mousedown', mouseDownHandler);
            canvas.removeEventListener('mouseup', mouseUpHandler);
        };
    }, [setBalls]);

    // Анимация и обработка столкновений шаров
    useEffect(() => {
        const render = () => {
            const canvas = canvasRef.current;
            const ctx = canvas?.getContext('2d');
            if (!ctx) return;

            ctx.clearRect(0, 0, width, height);
            ctx.fillStyle = '#113C5B';
            ctx.fillRect(0, 0, width, height);

            // Обновляем состояние шаров для следующего кадра
            setBalls(prevBalls => {
                let updatedBalls = prevBalls.map(ball => ({ ...ball }));

                const friction = 0.99; // Коэффициент трения, близкий к 1 будет означать маленькое трение

            updatedBalls.forEach(ball => {
                ball.velocityX *= friction;
                ball.velocityY *= friction;

                ball.x += ball.velocityX;
                ball.y += ball.velocityY;

    // Проверка столкновения с левой или правой стеной и коррекция положения
    if (ball.x - ball.radius <= 0) {
        ball.velocityX *= -0.9; // Отражение и потеря скорости
        ball.x = ball.radius; // Коррекция положения, чтобы шар не заходил за границу
    } else if (ball.x + ball.radius >= width) {
        ball.velocityX *= -0.9;
        ball.x = width - ball.radius;
    }

    // Проверка столкновения с верхней или нижней стеной и коррекция положения
    if (ball.y - ball.radius <= 0) {
        ball.velocityY *= -0.9;
        ball.y = ball.radius;
    } else if (ball.y + ball.radius >= height) {
        ball.velocityY *= -0.9;
        ball.y = height - ball.radius;
    }
});

        
                // Проверка и обработка столкновений между шарами
// Проверка и обработка столкновений между шарами
for (let i = 0; i < updatedBalls.length; i++) {
    for (let j = i + 1; j < updatedBalls.length; j++) {
        const dx = updatedBalls[j].x - updatedBalls[i].x;
        const dy = updatedBalls[j].y - updatedBalls[i].y;
        const distance = Math.sqrt(dx * dx + dy * dy);
        const overlap = updatedBalls[i].radius + updatedBalls[j].radius - distance;
        if (distance < updatedBalls[i].radius + updatedBalls[j].radius) {
            // Расчет вектора нормали столкновения
            const nx = dx / distance;
            const ny = dy / distance;
            // Раздвигаем шары, чтобы они не "слипались"
            updatedBalls[i].x -= nx * overlap / 2;
            updatedBalls[i].y -= ny * overlap / 2;
            updatedBalls[j].x += nx * overlap / 2;
            updatedBalls[j].y += ny * overlap / 2;
            // Расчет скоростей после столкновения (для упрощения считаем массы одинаковыми)
            const vx1 = updatedBalls[i].velocityX - updatedBalls[j].velocityX;
            const vy1 = updatedBalls[i].velocityY - updatedBalls[j].velocityY;
            const dotProduct = vx1 * nx + vy1 * ny;
            // Расчет компонент скоростей вдоль вектора столкновения
            if (dotProduct > 0) {
                const collisionScale = dotProduct / distance;
                const collisionX = nx * collisionScale;
                const collisionY = ny * collisionScale;
                // Обновление скоростей с учетом упругости столкновения
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

            // Отрисовка шаров
            balls.forEach(ball => drawBall(ctx, ball));
        };

        const animationFrameId = requestAnimationFrame(render);

        return () => cancelAnimationFrame(animationFrameId);
    }, [balls, width, height, setBalls]);

    return <canvas className="canvas" ref={canvasRef} width={width} height={height}></canvas>;
};

export default Table;
