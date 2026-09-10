import React, { useState, useEffect, useRef } from "react";
import { DotPattern } from "./dot-pattern";
import { cn } from "@/lib/utils";

export function InteractiveDotBackground({ className }) {
  const [smoothPos, setSmoothPos] = useState({ x: -1000, y: -1000 });
  const [isHovered, setIsHovered] = useState(false);
  const [ripples, setRipples] = useState([]);
  const animFrameRef = useRef(null);
  const targetPosRef = useRef({ x: -1000, y: -1000 });

  useEffect(() => {
    const handleMouseMove = (e) => {
      targetPosRef.current = { x: e.clientX, y: e.clientY };
      if (!isHovered) setIsHovered(true);
    };

    const handleMouseLeave = () => {
      setIsHovered(false);
    };

    const handleClick = (e) => {
      const newRipple = {
        id: Date.now() + Math.random(),
        x: e.clientX,
        y: e.clientY,
      };
      setRipples((prev) => [...prev.slice(-3), newRipple]);
      setTimeout(() => {
        setRipples((prev) => prev.filter((r) => r.id !== newRipple.id));
      }, 1200);
    };

    const updatePosition = () => {
      setSmoothPos((prev) => {
        const dx = targetPosRef.current.x - prev.x;
        const dy = targetPosRef.current.y - prev.y;
        if (Math.abs(dx) < 0.2 && Math.abs(dy) < 0.2) {
          return prev;
        }
        return {
          x: prev.x + dx * 0.12,
          y: prev.y + dy * 0.12,
        };
      });
      animFrameRef.current = requestAnimationFrame(updatePosition);
    };

    window.addEventListener("mousemove", handleMouseMove, { passive: true });
    document.addEventListener("mouseleave", handleMouseLeave);
    window.addEventListener("click", handleClick, { passive: true });
    animFrameRef.current = requestAnimationFrame(updatePosition);

    return () => {
      window.removeEventListener("mousemove", handleMouseMove);
      document.removeEventListener("mouseleave", handleMouseLeave);
      window.removeEventListener("click", handleClick);
      if (animFrameRef.current) cancelAnimationFrame(animFrameRef.current);
    };
  }, [isHovered]);

  return (
    <div
      aria-hidden="true"
      className={cn(
        "pointer-events-none fixed inset-0 z-0 overflow-hidden select-none",
        className
      )}
    >
      {/* Ambient background dots layer */}
      <DotPattern
        width={24}
        height={24}
        cx={1.2}
        cy={1.2}
        cr={1}
        className="fill-black/25 transition-opacity duration-1000 animate-pulse [animation-duration:8s] [mask-image:radial-gradient(ellipse_at_center,black_50%,transparent_95%)]"
      />

      {/* Interactive cursor spotlight layer */}
      {isHovered && (
        <div
          className="absolute inset-0 transition-opacity duration-300 pointer-events-none"
          style={{
            maskImage: `radial-gradient(360px circle at ${smoothPos.x}px ${smoothPos.y}px, black 0%, transparent 80%)`,
            WebkitMaskImage: `radial-gradient(360px circle at ${smoothPos.x}px ${smoothPos.y}px, black 0%, transparent 80%)`,
          }}
        >
          <DotPattern
            width={24}
            height={24}
            cx={1.2}
            cy={1.2}
            cr={1.5}
            className="fill-black/85"
          />
          {/* Subtle cursor aura */}
          <div
            className="absolute rounded-full pointer-events-none blur-3xl opacity-10 bg-black -translate-x-1/2 -translate-y-1/2"
            style={{
              width: "280px",
              height: "280px",
              left: `${smoothPos.x}px`,
              top: `${smoothPos.y}px`,
            }}
          />
        </div>
      )}

      {/* Click interactive wave ripples */}
      {ripples.map((ripple) => (
        <span
          key={ripple.id}
          className="absolute rounded-full border border-black/35 pointer-events-none animate-ping [animation-duration:1.2s] -translate-x-1/2 -translate-y-1/2"
          style={{
            left: `${ripple.x}px`,
            top: `${ripple.y}px`,
            width: "160px",
            height: "160px",
          }}
        />
      ))}
    </div>
  );
}

export default InteractiveDotBackground;
