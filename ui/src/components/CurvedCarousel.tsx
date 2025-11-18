"use client";

import React, { useEffect, useState } from "react";
import { motion, useAnimation } from "framer-motion";

const cartoonsList = [
    "SpongeBob",
    "Dexter's Lab",
    "The Simpsons",
    "Adventure Time",
    "Rick & Morty",
    "Avatar: TLA",
    "Gravity Falls",
    "Phineas & Ferb",
    "Regular Show",
    "Scooby-Doo",
    "Tom & Jerry",
    "Looney Tunes",
];

// Duplicate items to fill the large circumference and reduce gaps
const cartoons = [...cartoonsList, ...cartoonsList, ...cartoonsList];

export function CurvedCarousel() {
    const [isHovered, setIsHovered] = useState(false);
    const controls = useAnimation();

    // Carousel configuration
    const ITEM_WIDTH = 300;
    const RADIUS = 1000; // Adjusted radius for 3D effect

    // Auto-rotation animation
    useEffect(() => {
        if (!isHovered) {
            controls.start({
                rotateY: 360,
                transition: {
                    duration: 120,
                    ease: "linear",
                    repeat: Infinity,
                }
            });
        } else {
            controls.stop();
        }
    }, [isHovered, controls]);

    return (
        <section className="w-full py-4 border-t border-border/50 overflow-hidden bg-background/50 perspective-[600px] relative z-20">
            {/* Gradient Masks for depth */}
            <div className="absolute inset-0 bg-gradient-to-b from-background via-transparent to-background z-10 pointer-events-none" />
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,transparent_0%,hsl(var(--background))_100%)] z-10 pointer-events-none" />

            {/* Side Fades */}
            <div className="absolute left-0 top-0 bottom-0 w-64 bg-gradient-to-r from-background via-background/80 to-transparent z-50 pointer-events-none" />
            <div className="absolute right-0 top-0 bottom-0 w-64 bg-gradient-to-l from-background via-background/80 to-transparent z-50 pointer-events-none" />

            <div className="relative h-[260px] flex items-center justify-center preserve-3d">
                <motion.div
                    className="relative flex items-center justify-center preserve-3d"
                    animate={controls}
                    initial={{ rotateY: 0 }}
                    onHoverStart={() => setIsHovered(true)}
                    onHoverEnd={() => setIsHovered(false)}
                    style={{
                        transformStyle: "preserve-3d",
                        width: ITEM_WIDTH,
                        height: 220
                    }}
                >
                    {cartoons.map((cartoon, index) => {
                        const angle = (360 / cartoons.length) * index;

                        return (
                            <div
                                key={index}
                                className="absolute flex items-center justify-center p-8 cursor-pointer group"
                                style={{
                                    width: ITEM_WIDTH,
                                    height: 220,
                                    transform: `rotateY(${angle}deg) translateZ(${RADIUS}px)`,
                                    backfaceVisibility: "hidden",
                                }}
                            >
                                <div className="text-center">
                                    <h3 className="text-2xl font-bold text-foreground group-hover:text-primary transition-colors">
                                        {cartoon}
                                    </h3>
                                    <p className="text-sm text-muted-foreground mt-3 uppercase tracking-wider font-medium">
                                        Series
                                    </p>
                                </div>
                            </div>
                        );
                    })}
                </motion.div>
            </div>
        </section>
    );
}
