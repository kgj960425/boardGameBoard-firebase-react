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
// import Layout from './views/layout/Layout.tsx';

// @ts-ignore
// const Main = React.lazy(() => import("./pages/LandingPage"))

// 처음 접속시 무조건 Route path="/" element={<LandingPage/>}로 이동된다.아래의 Main 함수는 변경해도 무의미
// @ts-ignore
const Main = React.lazy(() => import("./pages/Store.tsx"))

function App() {
  return (
    <Suspense fallback={<Loading />}>
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
  );
}

export default App
