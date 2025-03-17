import React, { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import './index.css';
import App from './App.tsx';
import { BrowserRouter } from 'react-router-dom';

// StrictMode를 제어하는 변수
const isStrictMode = import.meta.env.VITE_USE_STRICT_MODE ; // 환경변수에서 필요에 따라 true/false 변경

createRoot(document.getElementById('root')!).render(
  isStrictMode ? (
    <StrictMode>
      <BrowserRouter>
        <App />
      </BrowserRouter>
    </StrictMode>
  ) : (
    <BrowserRouter>
      <App />
    </BrowserRouter>
  )
);
