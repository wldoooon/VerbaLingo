'use client';

import React, { useEffect, useRef } from 'react';
import { useTheme } from 'next-themes';

interface TechnicalLatticeProps {
    gridSize?: number;
    opacity?: number;
}

const TechnicalLattice: React.FC<TechnicalLatticeProps> = ({
    gridSize = 80,
    opacity = 0.6,
}) => {
    const canvasRef = useRef<HTMLCanvasElement | null>(null);
    const { resolvedTheme } = useTheme();

    useEffect(() => {
        const isDark = resolvedTheme === 'dark';
        const baseColor = isDark ? '255, 255, 255' : '0, 0, 0';
        const canvas = canvasRef.current;
        if (!canvas) return;
        const ctx = canvas.getContext('2d');
        if (!ctx) return;

        let width = 0;
        let height = 0;
        let animationId: number;
        let time = 0;

        const labels = [
            '[ ENGLISH ]',
            '[ CONTEXT ]',
            '[ .CLIP ]',
            '[ SYNC ]',
            '[ NEURAL ]',
            '[ 14.2M ]',
            '[ STREAM ]'
        ];

        // Initialize random technical elements snapped to grid
        const staticElements = Array.from({ length: 20 }, () => ({
            x: Math.random(),
            y: Math.random(),
            label: labels[Math.floor(Math.random() * labels.length)],
            type: Math.random() > 0.6 ? 'star' : 'label',
            speed: 0.2 + Math.random() * 0.5
        }));

        const resize = () => {
            const dpr = window.devicePixelRatio || 1;
            width = window.innerWidth;
            height = window.innerHeight;
            canvas.width = width * dpr;
            canvas.height = height * dpr;
            canvas.style.width = `${width}px`;
            canvas.style.height = `${height}px`;
            ctx.scale(dpr, dpr);
        };

        const drawStar = (x: number, y: number, size: number, glow: number) => {
            ctx.save();
            ctx.translate(x, y);
            ctx.rotate(time * 0.01);

            // Outer Glow
            ctx.shadowBlur = 15 * glow;
            ctx.shadowColor = '#ff4d00';

            ctx.beginPath();
            ctx.strokeStyle = `rgba(255, 77, 0, ${0.7 * glow})`;
            ctx.lineWidth = 1.5;

            // Draw cross-hair star
            ctx.moveTo(-size, 0);
            ctx.lineTo(size, 0);
            ctx.moveTo(0, -size);
            ctx.lineTo(0, size);
            ctx.stroke();

            // Center core
            ctx.beginPath();
            ctx.fillStyle = `rgba(255, 77, 0, ${1.0 * glow})`;
            ctx.arc(0, 0, 2, 0, Math.PI * 2);
            ctx.fill();

            ctx.restore();
        };

        const animate = () => {
            time += 0.5;
            ctx.clearRect(0, 0, width, height);

            // 1. Draw Technical Grid
            ctx.beginPath();
            ctx.strokeStyle = `rgba(${baseColor}, ${0.08 * opacity})`;
            ctx.lineWidth = 0.5;

            for (let x = 0; x <= width; x += gridSize) {
                ctx.moveTo(x, 0);
                ctx.lineTo(x, height);
            }
            for (let y = 0; y <= height; y += gridSize) {
                ctx.moveTo(0, y);
                ctx.lineTo(width, y);
            }
            ctx.stroke();

            // 2. Draw Intersection Nodes
            ctx.fillStyle = `rgba(255, 77, 0, ${0.25 * opacity})`;
            for (let x = 0; x <= width; x += gridSize) {
                for (let y = 0; y <= height; y += gridSize) {
                    ctx.beginPath();
                    ctx.arc(x, y, 1.5, 0, Math.PI * 2);
                    ctx.fill();
                }
            }

            // 4. Draw Labels and Glowing Stars
            staticElements.forEach((el, i) => {
                const x = el.x * width;
                const y = (el.y * height + time * el.speed * 0.1) % height;
                const pulse = (Math.sin(time * 0.02 + i) + 1) / 2;

                // Snap positioning to the grid
                const snappedX = Math.round(x / gridSize) * gridSize;
                const snappedY = Math.round(y / gridSize) * gridSize;

                if (el.type === 'star') {
                    drawStar(snappedX, snappedY, 8, pulse);
                } else {
                    ctx.font = '700 9px monospace';
                    ctx.fillStyle = `rgba(${baseColor}, ${0.2 + pulse * 0.3})`;
                    ctx.textAlign = 'center';
                    ctx.fillText(el.label, snappedX + gridSize / 2, snappedY + gridSize / 2);
                }
            });

            animationId = requestAnimationFrame(animate);
        };

        resize();
        animate();
        window.addEventListener('resize', resize);

        return () => {
            window.removeEventListener('resize', resize);
            cancelAnimationFrame(animationId);
        };
    }, [gridSize, opacity, resolvedTheme]);

    const containerStyle: React.CSSProperties = {
        position: 'absolute',
        top: 0,
        left: 0,
        width: '100%',
        height: '100%',
        zIndex: 0,
        pointerEvents: 'none',
        // Combined Mask: Fades from top (navbar) AND from left (sidebar)
        maskImage: 'linear-gradient(to bottom, transparent, transparent 100px, black 150px), linear-gradient(to right, transparent, transparent 300px, black 400px)',
        WebkitMaskImage: 'linear-gradient(to bottom, transparent, transparent 100px, black 150px), linear-gradient(to right, transparent, transparent 300px, black 400px)',
        maskComposite: 'intersect',
        WebkitMaskComposite: 'source-in',
    };

    return (
        <div style={containerStyle}>
            <canvas ref={canvasRef} />
        </div>
    );
};

export default TechnicalLattice;
