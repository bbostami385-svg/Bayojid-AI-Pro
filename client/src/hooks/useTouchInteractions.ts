import React, { useRef, useCallback, useEffect } from "react";

interface TouchInteractionOptions {
  onSwipeLeft?: () => void;
  onSwipeRight?: () => void;
  onSwipeUp?: () => void;
  onSwipeDown?: () => void;
  onLongPress?: () => void;
  onDoubleTap?: () => void;
  threshold?: number;
  longPressDelay?: number;
}

interface TouchPosition {
  x: number;
  y: number;
  timestamp: number;
}

/**
 * Hook for handling touch interactions on mobile devices
 * Supports swipe gestures, long press, and double tap
 */
export function useTouchInteractions(options: TouchInteractionOptions) {
  const touchStartRef = useRef<TouchPosition | null>(null);
  const longPressTimerRef = useRef<NodeJS.Timeout | null>(null);
  const lastTapRef = useRef<number>(0);

  const threshold = options.threshold || 50;
  const longPressDelay = options.longPressDelay || 500;

  const handleTouchStart = useCallback(
    (e: React.TouchEvent<HTMLElement>) => {
      const touch = e.touches[0];
      touchStartRef.current = {
        x: touch.clientX,
        y: touch.clientY,
        timestamp: Date.now(),
      };

      // Start long press timer
      longPressTimerRef.current = setTimeout(() => {
        if (options.onLongPress) {
          options.onLongPress();
        }
      }, longPressDelay);

      // Check for double tap
      const now = Date.now();
      const timeSinceLastTap = now - lastTapRef.current;

      if (timeSinceLastTap < 300 && timeSinceLastTap > 0) {
        if (options.onDoubleTap) {
          options.onDoubleTap();
        }
        lastTapRef.current = 0;
      } else {
        lastTapRef.current = now;
      }
    },
    [options, longPressDelay]
  );

  const handleTouchEnd = useCallback(
    (e: React.TouchEvent<HTMLElement>) => {
      // Clear long press timer
      if (longPressTimerRef.current) {
        clearTimeout(longPressTimerRef.current);
        longPressTimerRef.current = null;
      }

      if (!touchStartRef.current) return;

      const touch = e.changedTouches[0];
      const deltaX = touch.clientX - touchStartRef.current.x;
      const deltaY = touch.clientY - touchStartRef.current.y;
      const distance = Math.sqrt(deltaX * deltaX + deltaY * deltaY);

      // Ignore small movements
      if (distance < 10) return;

      // Determine swipe direction
      const absDeltaX = Math.abs(deltaX);
      const absDeltaY = Math.abs(deltaY);

      if (absDeltaX > threshold && absDeltaX > absDeltaY) {
        // Horizontal swipe
        if (deltaX > 0 && options.onSwipeRight) {
          options.onSwipeRight();
        } else if (deltaX < 0 && options.onSwipeLeft) {
          options.onSwipeLeft();
        }
      } else if (absDeltaY > threshold && absDeltaY > absDeltaX) {
        // Vertical swipe
        if (deltaY > 0 && options.onSwipeDown) {
          options.onSwipeDown();
        } else if (deltaY < 0 && options.onSwipeUp) {
          options.onSwipeUp();
        }
      }

      touchStartRef.current = null;
    },
    [options, threshold]
  );

  const handleTouchCancel = useCallback(() => {
    if (longPressTimerRef.current) {
      clearTimeout(longPressTimerRef.current);
      longPressTimerRef.current = null;
    }
    touchStartRef.current = null;
  }, []);

  return {
    onTouchStart: handleTouchStart,
    onTouchEnd: handleTouchEnd,
    onTouchCancel: handleTouchCancel,
  };
}

/**
 * Hook for handling pinch zoom gestures
 */
export function usePinchZoom(onZoom?: (scale: number) => void) {
  const initialDistanceRef = useRef<number | null>(null);
  const initialScaleRef = useRef<number>(1);

  const handleTouchStart = useCallback((e: React.TouchEvent<HTMLElement>) => {
    if (e.touches.length === 2) {
      const touch1 = e.touches[0];
      const touch2 = e.touches[1];
      const distance = Math.hypot(
        touch2.clientX - touch1.clientX,
        touch2.clientY - touch1.clientY
      );
      initialDistanceRef.current = distance;
    }
  }, []);

  const handleTouchMove = useCallback(
    (e: React.TouchEvent<HTMLElement>) => {
      if (e.touches.length === 2 && initialDistanceRef.current) {
        const touch1 = e.touches[0];
        const touch2 = e.touches[1];
        const distance = Math.hypot(
          touch2.clientX - touch1.clientX,
          touch2.clientY - touch1.clientY
        );
        const scale = distance / initialDistanceRef.current;

        if (onZoom) {
          onZoom(scale);
        }
      }
    },
    [onZoom]
  );

  const handleTouchEnd = useCallback(() => {
    initialDistanceRef.current = null;
  }, []);

  return {
    onTouchStart: handleTouchStart,
    onTouchMove: handleTouchMove,
    onTouchEnd: handleTouchEnd,
  };
}

/**
 * Hook for handling haptic feedback on mobile devices
 */
export function useHapticFeedback() {
  const triggerHaptic = useCallback((pattern: "light" | "medium" | "heavy" = "medium") => {
    if ("vibrate" in navigator) {
      const patterns: Record<string, number | number[]> = {
        light: 10,
        medium: 20,
        heavy: [30, 10, 30],
      };
      navigator.vibrate(patterns[pattern]);
    }
  }, []);

  return { triggerHaptic };
}

/**
 * Hook for detecting if device is mobile
 */
export function useIsMobile() {
  const [isMobile, setIsMobile] = React.useState(false);

  useEffect(() => {
    const checkMobile = () => {
      const userAgent = navigator.userAgent;
      const isMobileDevice =
        /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(userAgent);
      setIsMobile(isMobileDevice);
    };

    checkMobile();
    window.addEventListener("resize", checkMobile);
    return () => window.removeEventListener("resize", checkMobile);
  }, []);

  return isMobile;
}

/**
 * Hook for detecting orientation changes
 */
export function useOrientation() {
  const [orientation, setOrientation] = React.useState<"portrait" | "landscape">(
    window.innerHeight > window.innerWidth ? "portrait" : "landscape"
  );

  useEffect(() => {
    const handleOrientationChange = () => {
      setOrientation(window.innerHeight > window.innerWidth ? "portrait" : "landscape");
    };

    window.addEventListener("orientationchange", handleOrientationChange);
    window.addEventListener("resize", handleOrientationChange);

    return () => {
      window.removeEventListener("orientationchange", handleOrientationChange);
      window.removeEventListener("resize", handleOrientationChange);
    };
  }, []);

  return orientation;
}
