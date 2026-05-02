"use client";

import { useState, useRef, useEffect, useId } from "react";
import { motion } from "motion/react";
import { cn } from "@/lib/utils";

const easeOutQuint: [number, number, number, number] = [0.23, 1, 0.32, 1];

export type SmoothDropdownItem =
  | {
      type?: "item";
      id: string;
      label: string;
      icon?: React.ReactNode;
      suffix?: React.ReactNode;
      disabled?: boolean;
      destructive?: boolean;
      onClick?: () => void;
    }
  | { id: string; type: "divider" };

interface SmoothDropdownProps {
  /** Content shown in the closed (collapsed) trigger state */
  trigger: React.ReactNode;
  items: SmoothDropdownItem[];
  /** Width of the expanded panel in px. Default 220. */
  openWidth?: number;
  /** Height of the closed trigger in px. Default 36. */
  closedSize?: number;
  /** Width of the closed trigger in px. Defaults to closedSize (square). */
  closedWidth?: number;
  /** Which corner the panel expands from. Default "right". */
  align?: "left" | "right";
  /** Optional label rendered at the top of the open panel */
  label?: string;
  className?: string;
}

export function SmoothDropdown({
  trigger,
  items,
  openWidth = 220,
  closedSize = 36,
  closedWidth,
  align = "right",
  label,
  className,
}: SmoothDropdownProps) {
  const resolvedClosedWidth = closedWidth ?? closedSize;
  const uid = useId();
  const [isOpen, setIsOpen]       = useState(false);
  const [hoveredItem, setHovered] = useState<string | null>(null);
  const [contentHeight, setContentHeight] = useState(0);

  const containerRef = useRef<HTMLDivElement>(null);
  const contentRef   = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!contentRef.current) return;
    const ro = new ResizeObserver((e) => setContentHeight(Math.ceil(e[0].contentRect.height)));
    ro.observe(contentRef.current);
    return () => ro.disconnect();
  }, []);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node))
        setIsOpen(false);
    };
    if (isOpen) document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [isOpen]);

  const openHeight = Math.max(closedSize, contentHeight);

  return (
    <div
      ref={containerRef}
      className={cn("relative not-prose", className)}
      style={{ height: closedSize, width: resolvedClosedWidth }}
    >
      <motion.div
        layout
        initial={false}
        animate={{
          width:        isOpen ? openWidth : resolvedClosedWidth,
          height:       isOpen ? openHeight : closedSize,
          borderRadius: isOpen ? 14 : 8,
        }}
        transition={{ type: "spring", damping: 28, stiffness: 500, mass: 0.5 }}
        className={cn(
          "absolute top-0 z-50 bg-popover border border-border shadow-lg overflow-hidden",
          align === "right" ? "right-0" : "left-0",
        )}
        onClick={() => !isOpen && setIsOpen(true)}
        style={{ cursor: isOpen ? "default" : "pointer" }}
      >
        {/* Trigger — visible when closed */}
        <motion.div
          initial={false}
          animate={{ opacity: isOpen ? 0 : 1, scale: isOpen ? 0.8 : 1 }}
          transition={{ duration: 0.15 }}
          className="absolute inset-0 flex items-center justify-center"
          style={{ pointerEvents: isOpen ? "none" : "auto", willChange: "transform" }}
        >
          {trigger}
        </motion.div>

        {/* Panel — visible when open */}
        <div ref={contentRef}>
          <motion.div
            layout
            initial={false}
            animate={{ opacity: isOpen ? 1 : 0 }}
            transition={{ duration: 0.6, delay: isOpen ? 0.09 : 0 }}
            className="p-2"
            style={{ pointerEvents: isOpen ? "auto" : "none", willChange: "transform" }}
          >
            {label && (
              <motion.p
                initial={{ opacity: 0, x: 8 }}
                animate={{ opacity: isOpen ? 1 : 0, x: isOpen ? 0 : 8 }}
                transition={{ delay: isOpen ? 0.06 : 0, duration: 0.15, ease: easeOutQuint }}
                className="text-[10px] font-bold text-muted-foreground/60 uppercase tracking-widest px-2 pt-1 pb-1.5"
              >
                {label}
              </motion.p>
            )}

            <ul
              className="flex flex-col gap-0.5 m-0! p-0! list-none!"
              onMouseLeave={() => setHovered(null)}
            >
              {items.map((item, index) => {
                if ("type" in item && item.type === "divider") {
                  return (
                    <motion.hr
                      key={item.id}
                      initial={{ opacity: 0 }}
                      animate={{ opacity: isOpen ? 1 : 0 }}
                      transition={{ delay: isOpen ? 0.12 + index * 0.015 : 0 }}
                      className="border-border my-1!"
                    />
                  );
                }

                const isDestructive = item.destructive;
                const isHovered     = hoveredItem === item.id;

                return (
                  <motion.li
                    key={item.id}
                    initial={{ opacity: 0, x: 8 }}
                    animate={{ opacity: isOpen ? 1 : 0, x: isOpen ? 0 : 8 }}
                    transition={{
                      delay:    isOpen ? 0.06 + index * 0.02 : 0,
                      duration: isDestructive ? 0.12 : 0.15,
                      ease:     easeOutQuint,
                    }}
                    onMouseEnter={() => !item.disabled && setHovered(item.id)}
                    onClick={() => {
                      if (item.disabled) return;
                      setIsOpen(false);
                      item.onClick?.();
                    }}
                    className={cn(
                      "relative flex items-center gap-2.5 rounded-lg text-sm m-0! pl-3! py-2! pr-2! transition-colors duration-200 ease-out",
                      item.disabled ? "cursor-not-allowed opacity-50" : "cursor-pointer",
                      isDestructive
                        ? isHovered ? "text-red-600" : "text-muted-foreground"
                        : isHovered ? "text-foreground" : "text-muted-foreground",
                    )}
                  >
                    {/* Sliding background */}
                    {isHovered && !item.disabled && (
                      <motion.div
                        layoutId={`${uid}-bg`}
                        className={cn(
                          "absolute inset-0 rounded-lg",
                          isDestructive ? "bg-red-50 dark:bg-red-950/30" : "bg-muted",
                        )}
                        transition={{ type: "spring", damping: 30, stiffness: 520, mass: 0.8 }}
                      />
                    )}
                    {/* Left bar */}
                    {isHovered && !item.disabled && (
                      <motion.div
                        layoutId={`${uid}-bar`}
                        className={cn(
                          "absolute left-0 top-0 bottom-0 my-auto w-[3px] h-5 rounded-full",
                          isDestructive ? "bg-red-500" : "bg-foreground",
                        )}
                        transition={{ type: "spring", damping: 30, stiffness: 520, mass: 0.8 }}
                      />
                    )}
                    {item.icon && (
                      <span className="relative z-10 shrink-0">{item.icon}</span>
                    )}
                    <span className="font-medium relative z-10 flex-1">{item.label}</span>
                    {item.suffix && (
                      <span className="relative z-10 shrink-0 mr-1">{item.suffix}</span>
                    )}
                  </motion.li>
                );
              })}
            </ul>
          </motion.div>
        </div>
      </motion.div>
    </div>
  );
}
