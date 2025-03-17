import React, { Suspense } from 'react';
import './App.css'
import { Route, Routes } from 'react-router-dom';
import LandingPage from './pages/LandingPage.tsx';
import TraningPage from './pages/TraningPage.tsx';
import Loading from './pages/Loading.tsx';
import Navbar from './pages/Navbar.tsx';
// import Layout from './views/layout/Layout.tsx';

// @ts-ignore
const Main = React.lazy(() => import("./pages/LandingPage"))

function App() {
  return (
    <Suspense fallback={<Loading />}>
      <Navbar />
        <Routes>
            <Route path="/" element={<LandingPage/>} />
            <Route path="/TraningPage" element={<TraningPage/>} />
        </Routes>
    </Suspense>
  );
}

export default App
