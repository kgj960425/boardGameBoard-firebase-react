import React, { Suspense } from 'react';
import './App.css'
import { Route, Routes } from 'react-router-dom';
import LandingPage from './pages/LandingPage.tsx';
import TraningPage from './pages/TraningPage.tsx';
import Loading from './pages/Loading.tsx';
import Navbar from './pages/Navbar.tsx';
import Search from './pages/Search.tsx';
import MyPage from './pages/MyPage.tsx';
import Store from './pages/Store.tsx';
import Upload from './pages/Upload.tsx';
import Login from './pages/Login.tsx';
import ProtectRouter from './routers/ProtectRouter.tsx';
// import Layout from './views/layout/Layout.tsx';

// @ts-ignore
// const Main = React.lazy(() => import("./pages/LandingPage"))

// 처음 접속시 무조건 Route path="/" element={<LandingPage/>}로 이동된다.아래의 Main 함수는 변경해도 무의미
// @ts-ignore
const Main = React.lazy(() => import("./pages/Login.tsx"))

function App() {
  return (
    <>
      <Routes>
        <Route>
          <Route path="/Login" element={<Login/>} />
        </Route>
      </Routes>
      <ProtectRouter>
        <Suspense fallback={<Loading />}>
            {/* Navbar는 항상 보여야 하므로 이 위치에 배치 */}
            <Navbar />
            <Routes>
                <Route path="/" element={<LandingPage/>} />
                <Route path="/Store" element={<Store/>} />
                <Route path="/Upload" element={<Upload/>} />
                <Route path="/TraningPage" element={<TraningPage/>} />
                <Route path="/Search" element={<Search/>} />
                <Route path="/MyPage" element={<MyPage/>} />
            </Routes>
        </Suspense>
      </ProtectRouter>    
    </>
  );
}

export default App
