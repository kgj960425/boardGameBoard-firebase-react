import { PropsWithChildren } from 'react';
import { useLoginStore} from '../stores/LoginStore';
import { Navigate } from 'react-router-dom';

const ProtectRouter = (props: PropsWithChildren) => {
  const isLoginValid = useLoginStore((state) => state.isLoginValid); 

  //ofcId, ofcData, sso response 모두 정상이면 jwt 쿠키에 세팅, sso response 오류 시 다시 testsso로 redirect
  // const isAuthenticate = SsoJwt || getCookie('isLogin') || getCookie(jwtKey.ACCESS);

  //sso response 정상이면 화면표출, 오류시 null(임시)
  // 쿠키에 access 토큰이 없으면 무조건 임시 로그인 페이지로 (SSO 적용 후 변경)


  // 인증이 성공하면 props.children을 렌더링하여 보호된 페이지 표시.ren을 렌더링하여 보호된 페이지 표시.
  return isLoginValid ? (
    props.children
  )  : (
    <Navigate replace to="/login" />
  );
};

export default ProtectRouter;
