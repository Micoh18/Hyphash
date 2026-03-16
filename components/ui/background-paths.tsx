"use client";

import { useMemo } from "react";
import { motion } from "framer-motion";
import Link from "next/link";
import { Button } from "@/components/ui/button";

// Seeded pseudo-random for deterministic SSR/client renders
function seededRandom(seed: number) {
    const x = Math.sin(seed * 9301 + 49297) * 49297;
    return x - Math.floor(x);
}

interface SporeRay {
    id: number;
    angle: number;
    innerRadius: number;
    outerRadius: number;
    width: number;
    opacity: number;
    curve: number;
    delay: number;
}

function SporePrint() {
    const cx = 500;
    const cy = 500;
    const innerR = 65;
    const baseOuterR = 380;
    const rayCount = 260;

    const rays: SporeRay[] = useMemo(() => {
        return Array.from({ length: rayCount }, (_, i) => {
            const rand = seededRandom(i);
            const rand2 = seededRandom(i + 1000);
            const rand3 = seededRandom(i + 2000);
            const rand4 = seededRandom(i + 3000);

            const angle = (i / rayCount) * Math.PI * 2 + (rand - 0.5) * 0.02;
            const lengthVariation = 0.95 + rand2 * 0.05;
            const outerRadius = baseOuterR * lengthVariation;

            return {
                id: i,
                angle,
                innerRadius: innerR + rand3 * 8,
                outerRadius: outerRadius,
                width: 0.4 + rand * 1.4,
                opacity: 0.15 + rand2 * 0.55,
                curve: (rand3 - 0.5) * 18,
                delay: rand4 * 1.8,
            };
        });
    }, []);

    function rayPath(ray: SporeRay): string {
        const cos = Math.cos(ray.angle);
        const sin = Math.sin(ray.angle);

        const x1 = cx + cos * ray.innerRadius;
        const y1 = cy + sin * ray.innerRadius;
        const x2 = cx + cos * ray.outerRadius;
        const y2 = cy + sin * ray.outerRadius;

        // Perpendicular offset for slight curve
        const mx = (x1 + x2) / 2 + -sin * ray.curve;
        const my = (y1 + y2) / 2 + cos * ray.curve;

        return `M${x1},${y1} Q${mx},${my} ${x2},${y2}`;
    }

    return (
        <div className="absolute inset-0 pointer-events-none flex items-center justify-center translate-x-[20%] sm:translate-x-[25%] md:translate-x-[28%]">
            <svg
                className="w-[min(75vw,700px)] h-[min(75vw,700px)] text-stone-800 dark:text-stone-300"
                viewBox="0 0 1000 1000"
                fill="none"
            >
                <title>Spore Print</title>
                {rays.map((ray) => (
                    <motion.path
                        key={ray.id}
                        d={rayPath(ray)}
                        stroke="currentColor"
                        strokeWidth={ray.width}
                        strokeLinecap="round"
                        initial={{ pathLength: 0, opacity: 0 }}
                        animate={{ pathLength: 1, opacity: ray.opacity }}
                        transition={{
                            pathLength: {
                                duration: 5 + ray.delay * 1.5,
                                delay: ray.delay * 0.5,
                                ease: [0.25, 0.1, 0.25, 1],
                            },
                            opacity: {
                                duration: 1.2,
                                delay: ray.delay * 0.5,
                                ease: "easeOut",
                            },
                        }}
                    />
                ))}
            </svg>
        </div>
    );
}

export function BackgroundPaths({
    title = "Background Paths",
    buttonText = "Get Started",
    subtitle,
    onButtonClick,
    buttonHref,
}: {
    title?: string;
    buttonText?: string;
    subtitle?: string;
    onButtonClick?: () => void;
    buttonHref?: string;
}) {
    const words = title.split(" ");

    const buttonContent = (
        <Button
            variant="ghost"
            className="rounded-[1.15rem] px-8 py-6 text-lg font-semibold backdrop-blur-md
            bg-white/95 hover:bg-white/100 dark:bg-black/95 dark:hover:bg-black/100
            text-black dark:text-white transition-all duration-300
            group-hover:-translate-y-0.5 border border-black/10 dark:border-white/10
            hover:shadow-md dark:hover:shadow-neutral-800/50"
            onClick={onButtonClick}
        >
            <span className="opacity-90 group-hover:opacity-100 transition-opacity">
                {buttonText}
            </span>
            <span
                className="ml-3 opacity-70 group-hover:opacity-100 group-hover:translate-x-1.5
                transition-all duration-300"
            >
                &rarr;
            </span>
        </Button>
    );

    return (
        <div className="relative min-h-screen w-full flex items-center justify-center overflow-hidden bg-white dark:bg-neutral-950">
            <div className="absolute inset-0">
                <SporePrint />
            </div>

            <div className="relative z-10 container mx-auto px-6 md:px-12 lg:px-20 text-left">
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ duration: 2 }}
                    className="max-w-2xl"
                >
                    <h1 className="text-5xl sm:text-7xl md:text-8xl font-bold mb-8 tracking-tighter">
                        {words.map((word, wordIndex) => (
                            <span
                                key={wordIndex}
                                className="inline-block mr-4 last:mr-0"
                            >
                                {word.split("").map((letter, letterIndex) => (
                                    <motion.span
                                        key={`${wordIndex}-${letterIndex}`}
                                        initial={{ y: 100, opacity: 0 }}
                                        animate={{ y: 0, opacity: 1 }}
                                        transition={{
                                            delay:
                                                wordIndex * 0.1 +
                                                letterIndex * 0.03,
                                            type: "spring",
                                            stiffness: 150,
                                            damping: 25,
                                        }}
                                        className="inline-block text-transparent bg-clip-text
                                        bg-gradient-to-r from-neutral-900 to-neutral-700/80
                                        dark:from-white dark:to-white/80"
                                    >
                                        {letter}
                                    </motion.span>
                                ))}
                            </span>
                        ))}
                    </h1>

                    {subtitle && (
                        <motion.p
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.8, duration: 0.8 }}
                            className="text-lg md:text-xl text-neutral-600 dark:text-neutral-400 mb-10 max-w-xl"
                        >
                            {subtitle}
                        </motion.p>
                    )}

                    <div
                        className="inline-block group relative bg-gradient-to-b from-black/10 to-white/10
                        dark:from-white/10 dark:to-black/10 p-px rounded-2xl backdrop-blur-lg
                        overflow-hidden shadow-lg hover:shadow-xl transition-shadow duration-300"
                    >
                        {buttonHref ? (
                            <Link href={buttonHref}>{buttonContent}</Link>
                        ) : (
                            buttonContent
                        )}
                    </div>
                </motion.div>
            </div>
        </div>
    );
}
