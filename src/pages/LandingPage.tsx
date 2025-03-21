import { db } from '../pages/firebase';
import { doc, getDoc, setDoc, collection, getDocs, onSnapshot } from 'firebase/firestore';
import { SetStateAction, useEffect, useState } from 'react';
import { getAuth } from 'firebase/auth';

interface Room {
    roomName: string;
    gameStyle: string;
    gameState: string;
    id: string;
}

function LandingPage() {
    const [rooms, setRooms] = useState<Room[]>([]);
    
    const viewBoardGameRoom = async () => {
        try {
            const querySnapshot = await getDocs(collection(db, "room"));
            const productList = querySnapshot.docs.map((doc) => {
                const data = doc.data();
                return {
                    id: doc.id,
                    roomName: data.roomName,
                    gameStyle: data.gameStyle,
                    gameState: data.gameState,
                };
            });

            setRooms(productList); // 가져온 데이터로 상태 업데이트
        } catch (error) {
            console.error("Error fetching products:", error);
        }
    };


    // 보드게임 대기방 목록을 가져오는 함수
    // const viewBoardGameRooms = () => {
    //     // 데이터 실시간으로 가져오기 : onSnapshot : getDoc과 마찬가지로 Firestore에 저장된 document를 가져오는데 사용되는 메서드이다.
    //     // Firestore에 저장된 document나 collection의 변경 사항을 실시간으로 감지하고 처리하는데 사용되는 메서드이다.
    //     onSnapshot(doc(db, "boardGameRooms"), (doc) => {
    //         console.log(" data: ", doc.data());
    //         setRooms(doc.data());

    //         const productList = querySnapshot.docs.map((doc) => {
    //             const data = doc.data();
    //             return {
    //                 id: doc.id,
    //                 name: data.name,
    //                 pay: data.pay,
    //             };
    //         });

    //         setProducts(productList); 
    //     });

    //     // 데이터 실시간으로 가져오기 : onSnapshot : getDoc과 마찬가지로 Firestore에 저장된 document를 가져오는데 사용되는 메서드이다.
    //     // Firestore에 저장된 document나 collection의 변경 사항을 실시간으로 감지하고 처리하는데 사용되는 메서드이다.
    //     const unsub = onSnapshot(doc(db, "room"), (doc) => {
    //         console.log(" data: ", doc.data());
    //     });

    //     db.collection("boardGameRooms").get().then((querySnapshot) => {
    //         querySnapshot.forEach((doc) => {
    //             console.log(`${doc.id} => ${doc.data()}`);
    //         });
    
    
    
    //     }
    // }

    

    

    useEffect(() => {
        // 보드게임 대기방 목록을 가져오는 함수
        //viewBoardGameRooms();
        viewBoardGameRoom();



    }, []);

    return (
        <>  
            <div>
                LandingPage
            </div>
            {/* 
            1) 랜딩 페이지는 접속하면 무조건 보이도록 빈 페이지로 만들어 놓고
            2) 로그인 페이지로 이동하는 버튼을 따로 만들어 놓는다.
            3) Navbar는 항상 페이지 상단에 노출되도록 할 것. 
            */}
            <div className="container mt-3">
                <h1>상품 목록</h1>
                {rooms.map((rooms) => (
                    <div key={rooms.id} className="product">
                        <div className="thumbnail" style={{ backgroundImage: "url('https://placehold.co/600x400')" }}></div>
                        <div className="flex-grow-1 p-4">
                            <h5 className="title">방제 : {rooms.roomName}</h5>
                            <p className="date">게임 : {rooms.gameStyle}</p>
                            <p className="price">{rooms.gameState}</p>
                        </div>
                    </div>
                ))}
            </div>

        </> 
    );
}

export default LandingPage;
