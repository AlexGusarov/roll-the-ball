import React, { useState, useRef, useEffect } from 'react';
import { BallProps, drawBall, generateBalls } from './Ball';

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

    // Обработка событий мыши для "толкания" шаров
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
            ctx.fillStyle = 'green';
            ctx.fillRect(0, 0, width, height);

            // Обновляем состояние шаров для следующего кадра
            setBalls(balls => {
                const updatedBalls = balls.map(ball => ({ ...ball }));

                // Движение шаров
                updatedBalls.forEach(ball => {
                    ball.x += ball.velocityX;
                    ball.y += ball.velocityY;

                    // Отражение от стен
                    if (ball.x - ball.radius <= 0 || ball.x + ball.radius >= width) {
                        ball.velocityX *= -0.9;
                    }
                    if (ball.y - ball.radius <= 0 || ball.y + ball.radius >= height) {
                        ball.velocityY *= -0.9;
                    }
                });

                // Проверка и обработка столкновений между шарами
                for (let i = 0; i < updatedBalls.length; i++) {
                    for (let j = i + 1; j < updatedBalls.length; j++) {
                        const dx = updatedBalls[j].x - updatedBalls[i].x;
                        const dy = updatedBalls[j].y - updatedBalls[i].y;
                        const distance = Math.sqrt(dx * dx + dy * dy);
                        if (distance < updatedBalls[i].radius + updatedBalls[j].radius) {
                            // Простая обработка столкновения: обмен скоростями
                            let tempVx = updatedBalls[i].velocityX;
                            let tempVy = updatedBalls[i].velocityY;
                            updatedBalls[i].velocityX = updatedBalls[j].velocityX;
                            updatedBalls[i].velocityY = updatedBalls[j].velocityY;
                            updatedBalls[j].velocityX = tempVx;
                            updatedBalls[j].velocityY = tempVy;
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

    return <canvas ref={canvasRef} width={width} height={height}></canvas>;
};

export default Table;
