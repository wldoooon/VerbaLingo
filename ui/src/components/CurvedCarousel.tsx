"use client";

import React, { useEffect, useState } from "react";
import { motion, useAnimation } from "framer-motion";

const moviesList = [
    { title: "The Shawshank Redemption", img: "https://image.tmdb.org/t/p/w500/9cqNxx0GxF0bflZmeSMuL5tnGzr.jpg" },
    { title: "The Godfather", img: "https://image.tmdb.org/t/p/w500/3bhkrj58Vtu7enYsRolD1fZdja1.jpg" },
    { title: "The Dark Knight", img: "https://image.tmdb.org/t/p/w500/qJ2tW6WMUDux911r6m7haRef0WH.jpg" },
    { title: "Pulp Fiction", img: "https://image.tmdb.org/t/p/w500/d5iIlFn5s0ImszYzBPb8JPIfbXD.jpg" },
    { title: "Forrest Gump", img: "https://image.tmdb.org/t/p/w500/arw2vcBveWOVZr6pxd9XTd1TdQa.jpg" },
    { title: "Inception", img: "https://image.tmdb.org/t/p/w500/edv5CZvWj09upOsy2Y6IwDhK8bt.jpg" },
    { title: "Fight Club", img: "https://image.tmdb.org/t/p/w500/pB8BM7pdSp6B6Ih7QZ4DrQ3PmJK.jpg" },
    { title: "The Matrix", img: "https://image.tmdb.org/t/p/w500/f89U3ADr1oiB1s9GkdPOEpXUk5H.jpg" },
    { title: "Interstellar", img: "https://image.tmdb.org/t/p/w500/gEU2QniE6E77NI6lCU6MxlNBvIx.jpg" },
    { title: "Parasite", img: "https://image.tmdb.org/t/p/w500/7IiTTgloJzvGI1TAYymCfbfl3vT.jpg" },
    { title: "The Lord of the Rings", img: "https://image.tmdb.org/t/p/w500/6oom5QYQ2yQTMJIbnvbkBL9cHo6.jpg" },
    { title: "Gladiator", img: "https://image.tmdb.org/t/p/w500/ty8TGRuvJLPUmAR1H1nRIsgwvim.jpg" },
];

// Duplicate items to fill the large circumference and reduce gaps
const movies = [...moviesList, ...moviesList, ...moviesList];

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
                        height: 420
                    }}
                >
                    {movies.map((item, index) => {
                        const angle = (360 / movies.length) * index;

                        return (
                            <div
                                key={index}
                                className="absolute flex flex-col items-center justify-center p-4 cursor-pointer group"
                                style={{
                                    width: ITEM_WIDTH,
                                    height: 420,
                                    transform: `rotateY(${angle}deg) translateZ(${RADIUS}px)`,
                                    backfaceVisibility: "hidden",
                                }}
                            >
                                {/* Image Container */}
                                <div className="w-full h-98 rounded-xl overflow-hidden mb-4 shadow-lg border border-white/10 bg-muted">
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
                                        Movie
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
