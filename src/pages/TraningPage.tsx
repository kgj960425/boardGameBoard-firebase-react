import { useEffect, useState } from 'react'
import { db } from './firebase.tsx'
import { doc, getDocs, getDoc, collection } from 'firebase/firestore'

// Firebase 사용자는 데이터베이스 역할로 Cloud Firestore를 활용할 수 있다.
// 이 데이터베이스는 'collection > document > field' 3중 구조로 구성된다.

// Firestore의 getDoc 메서드는 Firestore에 저장된 document를 가져오는데 사용되는 메서드이다.
// getDoc(doc(firestore 연결 객체, collection 이름, document 이름)) 형태로 데이터를 추출하고 싶은 문서를 골라낸 뒤 data()로 확인 가능하다.

// 데이터 실시간으로 가져오기 : onSnapshot : getDoc과 마찬가지로 Firestore에 저장된 document를 가져오는데 사용되는 메서드이다.
// Firestore에 저장된 document나 collection의 변경 사항을 실시간으로 감지하고 처리하는데 사용되는 메서드이다.
// firebase 무료버전에는 데이터 조회 횟수 제한이 있으므로, 실시간으로 데이터를 가져오는 것은 그리 좋지 않을 것 같다.

function TraningPage() {
  const [count, setCount] = useState(0)
  const [nowTime, setNowTime] = useState("");
  const [test, setTest] = useState<any>()

  // 최초 마운트 시 데이터 가져오기
  useEffect(() => {
    setTest(null)

    const fetchData = async () => {
      //await getTest() // Firestore 문서 가져오기
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
      const querySnapshot = await getDocs(collection(db, 'product'))
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
