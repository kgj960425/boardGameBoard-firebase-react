import { useEffect, useState } from 'react'
import { db } from './firebase.tsx'
import { doc, getDocs, getDoc, collection } from 'firebase/firestore'

function TraningPage() {
  const [count, setCount] = useState(0)
  const [nowTime, setNowTime] = useState("");
  const [test, setTest] = useState<any>()

  // 최초 마운트 시 데이터 가져오기
  useEffect(() => {
    setTest(null)

    const fetchData = async () => {
      await getTest() // Firestore 문서 가져오기
      await fetchCollection() // 전체 컬렉션 가져오기
    }

    fetchData()

    const updateTime = () => {
      setNowTime(new Date().toLocaleString()); // 현재 시간 설정
    };

    updateTime(); // 초기 실행
    const interval = setInterval(updateTime, 1000); // 1초마다 업데이트

    return () => clearInterval(interval); // 컴포넌트 언마운트 시 인터벌 제거
  }, [])

  // 단일 문서 가져오기 (비동기 함수)
  const getTest = async () => {
    try {
      const docRef = doc(db, 'product', 'product1')
      const docSnap = await getDoc(docRef)

      if (docSnap.exists()) {
        console.log('Document data:', docSnap.data())
        setTest(docSnap.data())
      }
    } catch (error) {
      console.error('Error fetching document:', error)
    }
  }

  // 컬렉션 가져오기 (비동기 함수)
  const fetchCollection = async () => {
    try {
      const querySnapshot = await getDocs(collection(db, 'product1'))
      querySnapshot.forEach((doc) => {
        console.log(doc.id, '=>', doc.data())
      })
    } catch (error) {
      console.error('Error fetching data:', error)
    }
  }

  return (
    <>
      <h1>Exploding Kittens</h1>
      <div className="card">
        <div>
          {test !== undefined && <div>{test?.name}</div>}
        </div>
        <button onClick={() => setCount((count) => count + 1)}>
          count is {count}
        </button>
      </div>
      
      <div id="message">
        <h2>현재 시간 { nowTime  }</h2>
        <h1>Firebase Hosting Setup Complete</h1>
        <p>You're seeing this because you've successfully setup Firebase Hosting. Now it's time to go build something extraordinary!</p>
        <a id="time" target="_blank">Open Hosting Documentation</a>
      </div>    
    </>
  )
}

export default TraningPage
