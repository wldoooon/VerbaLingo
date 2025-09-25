"use client"

import { cn } from "@/lib/utils"

interface SiriOrbProps {
  size?: string
  className?: string
  colors?: {
    bg?: string
    c1?: string
    c2?: string
    c3?: string
  }
  animationDuration?: number
}

const SiriOrb: React.FC<SiriOrbProps> = ({
  size = "192px",
  className,
  colors,
  animationDuration = 20,
}) => {
  const defaultColors = {
    bg: "oklch(95% 0.02 264.695)",
    c1: "oklch(0.7641 0.2002 62.47)", // Pastel pink
    c2: "oklch(0.5534 0.0796 62.47)", // Pastel blue
    c3: "oklch(78% 0.14 280)", // Pastel purple/lavender
  }

  const finalColors = { ...defaultColors, ...colors }

  // Extract numeric value from size for calculations
  const sizeValue = parseInt(size.replace("px", ""), 10)

  // Responsive calculations based on size
  const blurAmount =
    sizeValue < 50
      ? Math.max(sizeValue * 0.008, 1) // Reduced blur for small sizes
      : Math.max(sizeValue * 0.015, 4)

  const contrastAmount =
    sizeValue < 50
      ? Math.max(sizeValue * 0.004, 1.2) // Reduced contrast for small sizes
      : Math.max(sizeValue * 0.008, 1.5)

  const dotSize =
    sizeValue < 50
      ? Math.max(sizeValue * 0.004, 0.05) // Smaller dots for small sizes
      : Math.max(sizeValue * 0.008, 0.1)

  const shadowSpread =
    sizeValue < 50
      ? Math.max(sizeValue * 0.004, 0.5) // Reduced shadow for small sizes
      : Math.max(sizeValue * 0.008, 2)

  // Adjust mask radius based on size to reduce black center in small sizes
  const maskRadius =
    sizeValue < 30
      ? "0%"
      : sizeValue < 50
        ? "5%"
        : sizeValue < 100
          ? "15%"
          : "25%"

  // Use more subtle contrast for very small sizes
  const finalContrast =
    sizeValue < 30
      ? 1.1 // Very subtle contrast for tiny sizes
      : sizeValue < 50
        ? Math.max(contrastAmount * 1.2, 1.3) // Reduced contrast for small sizes
        : contrastAmount

  return (
    <div
      className={cn("siri-orb", className)}
      style={
        {
          width: size,
          height: size,
          "--bg": finalColors.bg,
          "--c1": finalColors.c1,
          "--c2": finalColors.c2,
          "--c3": finalColors.c3,
          "--animation-duration": `${animationDuration}s`,
          "--blur-amount": `${blurAmount}px`,
          "--contrast-amount": finalContrast,
          "--dot-size": `${dotSize}px`,
          "--shadow-spread": `${shadowSpread}px`,
          "--mask-radius": maskRadius,
        } as React.CSSProperties
      }
    >
      <style jsx>{`
        @property --angle {
          syntax: "<angle>";
          inherits: false;
          initial-value: 0deg;
        }

        @property --wave1 {
          syntax: "<percentage>";
          inherits: false;
          initial-value: 0%;
        }

        @property --wave2 {
          syntax: "<percentage>";
          inherits: false;
          initial-value: 0%;
        }

        @property --wave3 {
          syntax: "<percentage>";
          inherits: false;
          initial-value: 0%;
        }

        .siri-orb {
          display: grid;
          grid-template-areas: "stack";
          overflow: visible;
          position: relative;
          transform: scale(1.1);
        }

        .siri-orb::before {
          content: "";
          display: block;
          grid-area: stack;
          width: 100%;
          height: 100%;
          transform: translateZ(0);
          background:
            radial-gradient(
              ellipse at 50% 50%,
              var(--c1) 0%,
              transparent 70%
            ),
            radial-gradient(
              ellipse at 30% 40%,
              var(--c2) 0%,
              transparent 60%
            ),
            radial-gradient(
              ellipse at 70% 60%,
              var(--c3) 0%,
              transparent 50%
            );
          filter: blur(var(--blur-amount)) contrast(var(--contrast-amount));
          animation: 
            rotate var(--animation-duration) linear infinite,
            pulse calc(var(--animation-duration) * 0.3) ease-in-out infinite alternate;
          clip-path: polygon(
            50% 0%,
            calc(50% + var(--wave1)) calc(10% + var(--wave2)),
            calc(50% + var(--wave3)) calc(20% + var(--wave1)),
            calc(50% + var(--wave2)) calc(30% + var(--wave3)),
            calc(50% + var(--wave1)) calc(40% + var(--wave2)),
            calc(50% + var(--wave3)) calc(50% + var(--wave1)),
            calc(50% + var(--wave2)) calc(60% + var(--wave3)),
            calc(50% + var(--wave1)) calc(70% + var(--wave2)),
            calc(50% + var(--wave3)) calc(80% + var(--wave1)),
            calc(50% + var(--wave2)) calc(90% + var(--wave3)),
            50% 100%,
            calc(50% - var(--wave2)) calc(90% + var(--wave3)),
            calc(50% - var(--wave3)) calc(80% + var(--wave1)),
            calc(50% - var(--wave1)) calc(70% + var(--wave2)),
            calc(50% - var(--wave2)) calc(60% + var(--wave3)),
            calc(50% - var(--wave3)) calc(50% + var(--wave1)),
            calc(50% - var(--wave1)) calc(40% + var(--wave2)),
            calc(50% - var(--wave2)) calc(30% + var(--wave3)),
            calc(50% - var(--wave3)) calc(20% + var(--wave1)),
            calc(50% - var(--wave1)) calc(10% + var(--wave2))
          );
        }

        .siri-orb::after {
          content: "";
          display: block;
          grid-area: stack;
          width: 120%;
          height: 120%;
          left: -10%;
          top: -10%;
          position: absolute;
          background:
            radial-gradient(
              ellipse at calc(30% + var(--wave1)) calc(30% + var(--wave2)),
              var(--c1) 0%,
              transparent 40%
            ),
            radial-gradient(
              ellipse at calc(70% + var(--wave2)) calc(70% + var(--wave3)),
              var(--c2) 0%,
              transparent 35%
            ),
            radial-gradient(
              ellipse at calc(50% + var(--wave3)) calc(20% + var(--wave1)),
              var(--c3) 0%,
              transparent 30%
            );
          filter: blur(calc(var(--blur-amount) * 1.5)) contrast(calc(var(--contrast-amount) * 0.8));
          animation: 
            rotate calc(var(--animation-duration) * 1.3) linear infinite reverse,
            wave1 calc(var(--animation-duration) * 0.4) ease-in-out infinite,
            wave2 calc(var(--animation-duration) * 0.6) ease-in-out infinite,
            wave3 calc(var(--animation-duration) * 0.8) ease-in-out infinite;
          mix-blend-mode: screen;
          opacity: 0.8;
        }

        @keyframes rotate {
          to {
            --angle: 360deg;
            transform: rotate(360deg) translateZ(0);
          }
        }

        @keyframes pulse {
          0% { transform: scale(0.95) translateZ(0); }
          100% { transform: scale(1.05) translateZ(0); }
        }

        @keyframes wave1 {
          0%, 100% { --wave1: -8%; }
          25% { --wave1: 12%; }
          50% { --wave1: -5%; }
          75% { --wave1: 8%; }
        }

        @keyframes wave2 {
          0%, 100% { --wave2: 6%; }
          33% { --wave2: -10%; }
          66% { --wave2: 15%; }
        }

        @keyframes wave3 {
          0%, 100% { --wave3: -12%; }
          20% { --wave3: 8%; }
          40% { --wave3: -6%; }
          60% { --wave3: 14%; }
          80% { --wave3: -9%; }
        }

        @media (prefers-reduced-motion: reduce) {
          .siri-orb::before,
          .siri-orb::after {
            animation: none;
          }
        }
      `}</style>
    </div>
  )
}

export default SiriOrb
