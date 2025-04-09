import { useEffect, useRef } from "react";

// 디바이스 타입은 이제 mobile / web 두 개만!
// type DeviceType = "mobile" | "web";

// 갤럭시 퀀텀4 기준(1080px 이하면 모바일)
// const getDeviceType = (width: number): DeviceType => {
//   return width <= 1080 ? "mobile" : "web";
// };

export const useResponsiveLogger = () => {
  const timeoutRef = useRef<number | null>(null);

  useEffect(() => {
    const handleResize = () => {
      // 디바운싱 처리
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }

      // 2초 뒤 로그 출력
      timeoutRef.current = window.setTimeout(() => {
        // const width = window.innerWidth;
        // const height = window.innerHeight;
        // const type = getDeviceType(width);

        // console.log(`✅ 화면 크기 변경됨`);
        // console.log(`➡️ width: ${width}px`);
        // console.log(`➡️ height: ${height}px`);
        // console.log(`➡️ 인식된 디바이스 타입: ${type}`);
      }, 2000);
    };

    // 초기 진입 시 한 번 실행
    handleResize();

    // resize 이벤트 리스너 등록
    window.addEventListener("resize", handleResize);

    return () => {
      window.removeEventListener("resize", handleResize);
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
    };
  }, []);
};
