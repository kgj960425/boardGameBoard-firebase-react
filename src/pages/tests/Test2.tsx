import React, { useRef, useState, useEffect } from 'react';
import './test.css';
import { db } from '../../firebase/firebase';
import { addDoc, collection, serverTimestamp, onSnapshot, query, orderBy } from 'firebase/firestore';

const Test = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const isDrawing = useRef(false);
  const lastPos = useRef({ x: 0, y: 0 });
  const [images, setImages] = useState<string[]>([]); // 저장된 이미지 리스트

  // 그림 그리기 관련
  const startDrawing = (e: React.MouseEvent) => {
    isDrawing.current = true;
    const rect = canvasRef.current!.getBoundingClientRect();
    lastPos.current = {
      x: e.clientX - rect.left,
      y: e.clientY - rect.top,
    };
  };

  const draw = (e: React.MouseEvent) => {
    if (!isDrawing.current) return;
    const ctx = canvasRef.current!.getContext('2d');
    if (!ctx) return;

    const rect = canvasRef.current!.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    ctx.beginPath();
    ctx.moveTo(lastPos.current.x, lastPos.current.y);
    ctx.lineTo(x, y);
    ctx.strokeStyle = 'black';
    ctx.lineWidth = 2;
    ctx.stroke();
    ctx.closePath();

    lastPos.current = { x, y };
  };

  const stopDrawing = () => {
    isDrawing.current = false;
  };

  const saveDrawing = async () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    try {
      const dataUrl = canvas.toDataURL('image/png');

      await addDoc(collection(db, 'drawings'), {
        imageBase64: dataUrl,
        createdAt: serverTimestamp(),
      });

      alert('저장 완료!');
    } catch (error) {
      console.error('Error saving drawing:', error);
      alert('저장 실패!');
    }
  };

  // Firestore에서 저장된 그림 가져오기
  useEffect(() => {
    const q = query(collection(db, 'drawings'), orderBy('createdAt', 'desc'));

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const imgs = snapshot.docs.map((doc) => doc.data().imageBase64);
      setImages(imgs);
    });

    return () => unsubscribe();
  }, []);

  return (
    <div className="test-container" style={{backgroundColor: '#f0f0f0', padding: '20px'}}>
        <div className="drawing-container">
            <canvas
            ref={canvasRef}
            width={400}
            height={400}
            className="drawing-canvas"
            onMouseDown={startDrawing}
            onMouseMove={draw}
            onMouseUp={stopDrawing}
            onMouseLeave={stopDrawing}
            />
            <button className="save-button" onClick={saveDrawing}>
            저장하기
            </button>
        </div>

        {/* ✅ preview-container는 항상 존재하게 */}
        <div className="preview-container">
            {images.length > 0 ? (
            <img
                src={images[0]}
                alt="최근 저장된 그림"
                className="preview-image"
                width={400}
                height={400}
            />
            ) : (
            <div
                className="preview-placeholder"
                style={{
                width: '400px',
                height: '400px',
                border: '2px dashed #ccc',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#aaa',
                fontStyle: 'italic',
                }}
            >
                저장된 그림 없음
            </div>
            )}
        </div>
    </div>
  );
};

export default Test;
