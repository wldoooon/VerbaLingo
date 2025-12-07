"use client";

import React, { useEffect, useState } from "react";
import { motion, useAnimation } from "framer-motion";

const talksList = [
    { title: "Lex Fridman", img: "https://yt3.googleusercontent.com/YC7GvWFOuUvVlHxMDsfrKGUhVNvtL2QWQJ3GtLnqKR4vRqGGy7yqKQKL7J9kRr1Xhw=s900-c-k-c0x00ffffff-no-rj", type: "Podcast" },
    { title: "Joe Rogan", img: "https://yt3.googleusercontent.com/VyQPYHCgdQKfG89O3LNMrXdQPT3J9MdsMHM8OesJBG1YY7mCL2F7lZK9M2jLgFr4xYj0=s900-c-k-c0x00ffffff-no-rj", type: "Podcast" },
    { title: "TED Talks", img: "https://yt3.googleusercontent.com/ytc/AIdro_l2YLDSqjHKx1fz2k8kY1v8y1XJCxhj3mYO3YS_OEZQYw=s900-c-k-c0x00ffffff-no-rj", type: "Talk" },
    { title: "Jordan Peterson", img: "https://yt3.googleusercontent.com/PyC7GvWFb5J7Nve7kNqEo1_mRBpDDFaq3v7kPZY5IxbNrF3L5Y9mL_M7O9b6jY7v1w=s900-c-k-c0x00ffffff-no-rj", type: "Podcast" },
    { title: "Huberman Lab", img: "https://yt3.googleusercontent.com/5DNgJM4Z3xPqXDxHqBd3mOp2qY9RMlGY9xLQ_7zVxKe3_Y0Z3mYQ5bMlEqKHdNL9xQ=s900-c-k-c0x00ffffff-no-rj", type: "Podcast" },
    { title: "Tim Ferriss", img: "https://yt3.googleusercontent.com/ytc/AIdro_mKP7TQkj_UuPX5nUQNRGrVSR0K3m9u9PKPKXf_qL0I=s900-c-k-c0x00ffffff-no-rj", type: "Podcast" },
    { title: "Naval Ravikant", img: "https://pbs.twimg.com/profile_images/1256841238298292232/ycqwaMI2_400x400.jpg", type: "Talk" },
    { title: "Sam Harris", img: "https://yt3.googleusercontent.com/ytc/AIdro_nQUxEh4RVg8lrwUNxvVQFqKBKlZ8vVrLJ2qMHnDA=s900-c-k-c0x00ffffff-no-rj", type: "Podcast" },
    { title: "Y Combinator", img: "https://yt3.googleusercontent.com/ytc/AIdro_lGDx0_F6k8DmX7Cr6LqpTRQvA0E3J8eCMr9LqGEQ=s900-c-k-c0x00ffffff-no-rj", type: "Talk" },
    { title: "Vsauce", img: "https://yt3.googleusercontent.com/ytc/AIdro_n8_Kj9E8c9GqFp6Yk7N4Z1LR0I3D5M0QNnZ6Ae=s900-c-k-c0x00ffffff-no-rj", type: "Talk" },
    { title: "Neil deGrasse Tyson", img: "https://yt3.googleusercontent.com/ytc/AIdro_kxhY9hBTJnQr9yWLJW6VlR9B7dPJN2F1LqE8xH=s900-c-k-c0x00ffffff-no-rj", type: "Talk" },
    { title: "Diary of a CEO", img: "https://yt3.googleusercontent.com/G5EoVGYKqLz_-YUMZxvXJE0XRkX0_t0M3nC7rNrZ3L5fYk_V7sH8Jw=s900-c-k-c0x00ffffff-no-rj", type: "Podcast" },
];

// Duplicate items to fill the large circumference
const talks = [...talksList, ...talksList, ...talksList];

export function TalksPodcastCarousel() {
    const [isHovered, setIsHovered] = useState(false);
    const controls = useAnimation();

    // Carousel configuration
    const ITEM_WIDTH = 280;
    const RADIUS = 1500;

    // Auto-rotation animation (reverse direction)
    useEffect(() => {
        if (!isHovered) {
            controls.start({
                rotateY: -360,
                transition: {
                    duration: 100,
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
            {/* Title */}
            <div className="text-center mb-20 relative z-30">
                <h2 className="text-3xl sm:text-4xl font-bold text-foreground">
                    Over <span className="text-primary">50,000+</span> Talks & Podcasts
                </h2>
                <p className="text-muted-foreground mt-2 text-sm sm:text-base">
                    Learn from world-renowned speakers and thought leaders
                </p>
            </div>

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
                        height: 380
                    }}
                >
                    {talks.map((item, index) => {
                        const angle = (360 / talks.length) * index;

                        return (
                            <div
                                key={index}
                                className="absolute flex flex-col items-center justify-center p-4 cursor-pointer group"
                                style={{
                                    width: ITEM_WIDTH,
                                    height: 380,
                                    transform: `rotateY(${angle}deg) translateZ(${RADIUS}px)`,
                                    backfaceVisibility: "hidden",
                                }}
                            >
                                {/* Circular Image Container */}
                                <div className="w-48 h-48 rounded-full overflow-hidden mb-4 shadow-lg border-4 border-primary/20 bg-muted">
                                    <img
                                        src={item.img}
                                        alt={item.title}
                                        className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                                    />
                                </div>

                                <div className="text-center">
                                    <h3 className="text-lg font-bold text-foreground group-hover:text-primary transition-colors">
                                        {item.title}
                                    </h3>
                                    <p className="text-xs text-muted-foreground mt-1 uppercase tracking-wider font-medium">
                                        {item.type}
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
