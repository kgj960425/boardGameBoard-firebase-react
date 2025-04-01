// hooks/useResponsiveLogger.ts
import { useEffect, useRef } from "react";

type DeviceType = "mobile" | "tablet" | "desktop";

const getDeviceType = (width: number): DeviceType => {
  if (width <= 768) return "mobile";
  if (width <= 1280) return "tablet";
  return "desktop";
};

export const useResponsiveLogger = () => {
  const timeoutRef = useRef<number | null>(null);

  useEffect(() => {
    const handleResize = () => {
      // 디바운싱: 기존 타이머 제거
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }

      // 2초 후 콘솔 출력
      timeoutRef.current = window.setTimeout(() => {
        const width = window.innerWidth;
        const height = window.innerHeight;
        const type = getDeviceType(width);

        console.log(`✅ 화면 크기 변경됨`);
        console.log(`➡️ width: ${width}px`);
        console.log(`➡️ height: ${height}px`);
        console.log(`➡️ 인식된 디바이스 타입: ${type}`);
      }, 2000);
    };

    window.addEventListener("resize", handleResize);

    return () => {
      window.removeEventListener("resize", handleResize);
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
    };
  }, []);
};
