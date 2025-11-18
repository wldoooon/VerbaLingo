"use client";

import React, { useEffect, useState } from "react";
import { motion, useAnimation } from "framer-motion";

const cartoonsList = [
    { title: "SpongeBob", img: "https://images.unsplash.com/photo-1541963463532-d68292c34b19?w=400&q=80" },
    { title: "Dexter's Lab", img: "https://images.unsplash.com/photo-1618331835717-801e976710b2?w=400&q=80" },
    { title: "The Simpsons", img: "https://images.unsplash.com/photo-1608848461950-0fe51dfc41cb?w=400&q=80" },
    { title: "Adventure Time", img: "https://images.unsplash.com/photo-1518709268805-4e9042af9f23?w=400&q=80" },
    { title: "Rick & Morty", img: "https://images.unsplash.com/photo-1626544827763-d516dce335e2?w=400&q=80" },
    { title: "Avatar: TLA", img: "https://images.unsplash.com/photo-1518709268805-4e9042af9f23?w=400&q=80" },
    { title: "Gravity Falls", img: "https://images.unsplash.com/photo-1534293652835-535c6323f52b?w=400&q=80" },
    { title: "Phineas & Ferb", img: "https://images.unsplash.com/photo-1560167016-022b78a0258e?w=400&q=80" },
    { title: "Regular Show", img: "https://images.unsplash.com/photo-1505628346881-b72b27e84530?w=400&q=80" },
    { title: "Scooby-Doo", img: "https://images.unsplash.com/photo-1626544827763-d516dce335e2?w=400&q=80" },
    { title: "Tom & Jerry", img: "https://images.unsplash.com/photo-1541963463532-d68292c34b19?w=400&q=80" },
    { title: "Looney Tunes", img: "https://images.unsplash.com/photo-1618331835717-801e976710b2?w=400&q=80" },
];

// Duplicate items to fill the large circumference and reduce gaps
const cartoons = [...cartoonsList, ...cartoonsList, ...cartoonsList];

export function CurvedCarousel() {
    const [isHovered, setIsHovered] = useState(false);
    const controls = useAnimation();

    // Carousel configuration
    const ITEM_WIDTH = 300;
    const RADIUS = 1600; // Adjusted radius for 3D effect

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
                    {cartoons.map((item, index) => {
                        const angle = (360 / cartoons.length) * index;

                        return (
                            <div
                                key={index}
                                className="absolute flex flex-col items-center justify-center p-4 cursor-pointer group"
                                style={{
                                    width: ITEM_WIDTH,
                                    height: 220,
                                    transform: `rotateY(${angle}deg) translateZ(${RADIUS}px)`,
                                    backfaceVisibility: "hidden",
                                }}
                            >
                                {/* Image Container */}
                                <div className="w-full h-32 rounded-xl overflow-hidden mb-4 shadow-lg border border-white/10 bg-muted">
                                    <img
                                        src={item.img}
                                        alt={item.title}
                                        className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                                    />
                                </div>

                                <div className="text-center">
                                    <h3 className="text-xl font-bold text-foreground group-hover:text-primary transition-colors">
                                        {item.title}
                                    </h3>
                                    <p className="text-xs text-muted-foreground mt-1 uppercase tracking-wider font-medium">
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
