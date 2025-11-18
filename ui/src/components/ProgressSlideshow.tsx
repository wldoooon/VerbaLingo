"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Play } from "lucide-react";
import { Button } from "@/components/ui/button";

const slides = [
    {
        id: 1,
        title: "Learn from Cartoons",
        description: "Rediscover your childhood favorites. Learn English with simple dialogues and fun stories from classic cartoons.",
        image: "/Cartoon_Picture.jpg",
        color: "from-orange-500 to-red-600"
    },
    {
        id: 2,
        title: "Master with Podcasts",
        description: "Tune in to native conversations. Improve your listening skills with thousands of hours of engaging podcasts.",
        image: "/PodcastCollection.png",
        color: "from-purple-600 to-pink-900"
    },
    {
        id: 3,
        title: "Movies & TV Series",
        description: "Immerse yourself in cinema. Learn English naturally by watching your favorite blockbusters and series.",
        image: "/titanic-sinking-lifeboats-cinematic-desktop-wallpaper.jpg",
        color: "from-blue-600 to-indigo-900"
    }
];

export function ProgressSlideshow() {
    const [currentIndex, setCurrentIndex] = useState(0);
    const duration = 5000; // 5 seconds per slide

    useEffect(() => {
        const timer = setInterval(() => {
            setCurrentIndex((prev) => (prev + 1) % slides.length);
        }, duration);
        return () => clearInterval(timer);
    }, []);

    return (
        <div className="w-full h-[500px] relative overflow-hidden rounded-3xl shadow-2xl group bg-black">
            {/* Background Images with Transition */}
            <AnimatePresence mode="popLayout">
                <motion.div
                    key={currentIndex}
                    initial={{ opacity: 0, scale: 1.1 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.7 }}
                    className="absolute inset-0"
                >
                    <img
                        src={slides[currentIndex].image}
                        alt={slides[currentIndex].title}
                        className="w-full h-full object-cover opacity-60"
                    />
                    <div className={`absolute inset-0 bg-gradient-to-r ${slides[currentIndex].color} opacity-60 mix-blend-multiply`} />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/40 to-transparent" />
                </motion.div>
            </AnimatePresence>

            {/* Content Overlay */}
            <div className="absolute inset-0 p-8 md:p-12 flex flex-col justify-end md:justify-center z-20">
                <AnimatePresence mode="wait">
                    <motion.div
                        key={currentIndex}
                        initial={{ y: 20, opacity: 0 }}
                        animate={{ y: 0, opacity: 1 }}
                        exit={{ y: -20, opacity: 0 }}
                        transition={{ duration: 0.5 }}
                        className="max-w-2xl"
                    >
                        <h2 className="text-4xl md:text-6xl font-black text-white mb-4 tracking-tight drop-shadow-lg">
                            {slides[currentIndex].title}
                        </h2>
                        <p className="text-lg text-white/90 mb-8 leading-relaxed drop-shadow-md max-w-lg">
                            {slides[currentIndex].description}
                        </p>
                    </motion.div>
                </AnimatePresence>
            </div>

            {/* Progress Trackers */}
            <div className="absolute bottom-8 left-8 right-8 z-30 flex gap-4">
                {slides.map((slide, index) => (
                    <div
                        key={slide.id}
                        className="h-1.5 flex-1 bg-white/20 rounded-full overflow-hidden cursor-pointer hover:bg-white/30 transition-colors"
                        onClick={() => setCurrentIndex(index)}
                    >
                        {index === currentIndex && (
                            <motion.div
                                className="h-full bg-white shadow-[0_0_10px_rgba(255,255,255,0.5)]"
                                initial={{ width: "0%" }}
                                animate={{ width: "100%" }}
                                transition={{ duration: duration / 1000, ease: "linear" }}
                            />
                        )}
                        {index < currentIndex && <div className="h-full w-full bg-white/80" />}
                    </div>
                ))}
            </div>
        </div>
    );
}
