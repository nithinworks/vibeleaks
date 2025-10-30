import { lazy, Suspense, useEffect, useState } from "react";

const PixelBlast = lazy(() => import("@/components/ui/PixelBlast"));

export const BackgroundAnimation = () => {
  const [isScrolling, setIsScrolling] = useState(false);
  const [isVisible, setIsVisible] = useState(true);

  useEffect(() => {
    let scrollTimeout: NodeJS.Timeout;

    // Detect scrolling to pause animation
    const handleScroll = () => {
      setIsScrolling(true);
      clearTimeout(scrollTimeout);
      scrollTimeout = setTimeout(() => {
        setIsScrolling(false);
      }, 150);
    };

    // Detect visibility to pause when tab is hidden
    const handleVisibilityChange = () => {
      setIsVisible(!document.hidden);
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    document.addEventListener("visibilitychange", handleVisibilityChange);

    return () => {
      window.removeEventListener("scroll", handleScroll);
      document.removeEventListener("visibilitychange", handleVisibilityChange);
      clearTimeout(scrollTimeout);
    };
  }, []);

  // Don't render animation when scrolling or tab is hidden
  if (isScrolling || !isVisible) {
    return null;
  }

  return (
    <div className="absolute inset-0 pointer-events-none" style={{ zIndex: 0, opacity: 0.12 }}>
      <Suspense fallback={null}>
        <PixelBlast
          variant="circle"
          pixelSize={4}
          color="#E07A5F"
          patternScale={2.5}
          patternDensity={1.0}
          pixelSizeJitter={0.3}
          enableRipples={true}
          rippleSpeed={0.3}
          rippleThickness={0.12}
          rippleIntensityScale={1.0}
          speed={0.4}
          edgeFade={0.3}
          transparent={true}
          className="w-full h-full"
        />
      </Suspense>
    </div>
  );
};
