import { lazy, Suspense } from "react";

const PixelBlast = lazy(() => import("@/components/ui/PixelBlast"));

export const BackgroundAnimation = () => {
  return (
    <>
      {/* Light Mode Background */}
      <div className="fixed inset-0 pointer-events-none dark:hidden" style={{ zIndex: 0, opacity: 0.3 }}>
        <Suspense fallback={null}>
          <PixelBlast
            variant="circle"
            pixelSize={4}
            color="#E07A5F"
            patternScale={2.5}
            patternDensity={1.1}
            pixelSizeJitter={0.3}
            enableRipples={true}
            rippleSpeed={0.4}
            rippleThickness={0.12}
            rippleIntensityScale={1.2}
            speed={0.5}
            edgeFade={0.3}
            transparent={true}
            className="w-full h-full"
          />
        </Suspense>
      </div>

      {/* Dark Mode Background */}
      <div className="fixed inset-0 pointer-events-none hidden dark:block" style={{ zIndex: 0, opacity: 0.4 }}>
        <Suspense fallback={null}>
          <PixelBlast
            variant="circle"
            pixelSize={4}
            color="#FFA07A"
            patternScale={2.5}
            patternDensity={1.1}
            pixelSizeJitter={0.3}
            enableRipples={true}
            rippleSpeed={0.4}
            rippleThickness={0.12}
            rippleIntensityScale={1.2}
            speed={0.5}
            edgeFade={0.3}
            transparent={true}
            className="w-full h-full"
          />
        </Suspense>
      </div>
    </>
  );
};
