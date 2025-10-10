"use client";

import type { CSSProperties } from "react";
import { cn } from "@/lib/utils";

interface Game {
  id: string;
  title: string;
  image: string;
  year?: string;
}

const games: Game[] = [
  { id: "1", title: "Silent Hill 2", image: "https://images.igdb.com/igdb/image/upload/t_cover_big/co1r7k.jpg", year: "2001" },
  { id: "2", title: "GTA San Andreas", image: "https://images.igdb.com/igdb/image/upload/t_cover_big/co1x7m.jpg", year: "2004" },
  { id: "3", title: "The Last of Us", image: "https://images.igdb.com/igdb/image/upload/t_cover_big/co5vmg.jpg", year: "2013" },
  { id: "4", title: "God of War", image: "https://images.igdb.com/igdb/image/upload/t_cover_big/co1tmu.jpg", year: "2018" },
  { id: "5", title: "Red Dead Redemption 2", image: "https://images.igdb.com/igdb/image/upload/t_cover_big/co1q1f.jpg", year: "2018" },
  { id: "6", title: "The Witcher 3", image: "https://images.igdb.com/igdb/image/upload/t_cover_big/co5ume.jpg", year: "2015" },
  { id: "7", title: "Resident Evil 4", image: "https://images.igdb.com/igdb/image/upload/t_cover_big/co5w1r.jpg", year: "2005" },
  { id: "8", title: "Metal Gear Solid 3", image: "https://images.igdb.com/igdb/image/upload/t_cover_big/co2461.jpg", year: "2004" },
  { id: "9", title: "Uncharted 4", image: "https://images.igdb.com/igdb/image/upload/t_cover_big/co1r7l.jpg", year: "2016" },
  { id: "10", title: "Dark Souls 3", image: "https://images.igdb.com/igdb/image/upload/t_cover_big/co1vc2.jpg", year: "2016" },
  { id: "11", title: "Bloodborne", image: "https://images.igdb.com/igdb/image/upload/t_cover_big/co1vbn.jpg", year: "2015" },
  { id: "12", title: "Horizon Zero Dawn", image: "https://images.igdb.com/igdb/image/upload/t_cover_big/co1uu7.jpg", year: "2017" },
];

interface GameTickerProps {
  className?: string;
}

export const GameTicker = ({ className }: GameTickerProps) => {
  const duplicatedGames = [...games, ...games];
  const animationStyles: CSSProperties = { animationDuration: "48s" };

  return (
    <section
      aria-label="Featured games carousel"
      className={cn(
        "mx-auto w-full max-w-[1920px] px-4 py-8 sm:px-6",
        className,
      )}
    >
      <div className="relative h-[240px] overflow-hidden rounded-2xl border border-white/10 bg-card/60 backdrop-blur supports-[backdrop-filter]:bg-card/40">
        {/* Gradient edges */}
        <div className="pointer-events-none absolute inset-y-0 left-0 w-24 bg-gradient-to-r from-card to-transparent sm:w-32" />
        <div className="pointer-events-none absolute inset-y-0 right-0 w-24 bg-gradient-to-l from-card to-transparent sm:w-32" />

        {/* Scrolling track */}
        <div
          className="absolute left-0 top-0 flex h-full w-max gap-4 animate-scroll-left will-change-transform"
          style={animationStyles}
        >
          {duplicatedGames.map((game, index) => {
            const isClone = index >= games.length;

            return (
              <article
                key={`${game.id}-${index}`}
                className="flex h-full flex-shrink-0 items-stretch"
                aria-hidden={isClone}
              >
                <div className="group relative h-full w-[140px] overflow-hidden rounded-xl border border-white/10 bg-black/20 transition-transform duration-300 hover:scale-105 hover:shadow-2xl hover:shadow-primary/20 sm:w-[160px]">
                  <img
                    src={game.image}
                    alt={game.title}
                    className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-110"
                  />

                  <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/40 to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100">
                    <div className="absolute bottom-0 left-0 right-0 p-3">
                      <h3 className="text-sm font-semibold text-white line-clamp-2">
                        {game.title}
                      </h3>
                      {game.year && (
                        <p className="text-xs text-white/70">{game.year}</p>
                      )}
                    </div>
                  </div>

                  <div className="absolute bottom-0 left-0 right-0 p-2 bg-gradient-to-t from-black/80 to-transparent transition-opacity duration-300 lg:opacity-0 lg:group-hover:opacity-100">
                    <h3 className="text-xs font-medium text-white line-clamp-1">
                      {game.title}
                    </h3>
                  </div>
                </div>
              </article>
            );
          })}
        </div>
      </div>
    </section>
  );
};
