import React, { useEffect, useState } from 'react';

interface RealityFractureOverlayProps {
  isTriggered: boolean;
  onComplete?: () => void;
  reducedMotion?: boolean;
}

export const RealityFractureOverlay: React.FC<RealityFractureOverlayProps> = ({
  isTriggered,
  onComplete,
  reducedMotion = false,
}) => {
  const [active, setActive] = useState(false);

  useEffect(() => {
    if (isTriggered) {
      setActive(true);
      const timer = window.setTimeout(() => {
        setActive(false);
        if (onComplete) onComplete();
      }, 750);
      return () => clearTimeout(timer);
    }
  }, [isTriggered, onComplete]);

  if (!active || reducedMotion) return null;

  return (
    <div
      aria-hidden="true"
      className="pointer-events-none fixed inset-0 z-50 overflow-hidden mix-blend-screen"
    >
      {/* Glitch shift layer: Red Channel */}
      <div className="absolute inset-0 bg-transparent translate-x-1.5 opacity-40 shadow-[inset_0_0_80px_rgba(239,68,68,0.3)] animate-pulse" />
      
      {/* Glitch shift layer: Cyan Channel */}
      <div className="absolute inset-0 bg-transparent -translate-x-1.5 opacity-40 shadow-[inset_0_0_80px_rgba(6,182,212,0.3)]" />

      {/* Screen Fracture Lines */}
      <svg className="absolute inset-0 w-full h-full stroke-cyan-200/60 stroke-[1.5] filter drop-shadow-[0_0_8px_rgba(34,211,238,0.8)]">
        <line x1="12%" y1="0%" x2="38%" y2="52%" />
        <line x1="38%" y1="52%" x2="68%" y2="100%" />
        <line x1="38%" y1="52%" x2="22%" y2="85%" />
        <line x1="72%" y1="15%" x2="88%" y2="45%" />
        <line x1="88%" y1="45%" x2="94%" y2="100%" />
      </svg>

      {/* Temporal distortion flash */}
      <div className="absolute inset-0 bg-cyan-400/10 backdrop-invert-15 animate-ping duration-300" />
    </div>
  );
};
