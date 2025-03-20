import './Upload.css';
import { db } from '../pages/firebase';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { useEffect, useState } from 'react';
import { getAuth } from 'firebase/auth';

// const databaseUpload = () => {
//     const title = document.getElementById('title') as HTMLInputElement;
//     const content = document.getElementById('content') as HTMLTextAreaElement;
//     const price = document.getElementById('price') as HTMLInputElement;
//     //const image = document.getElementById('image') as HTMLInputElement;
//     const send = document.getElementById('send') as HTMLButtonElement;

//     send?.addEventListener('click', async () => {
//         try {
//             // 데이터 추가
//             await addDoc(collection(db, 'product'),{
//                 title: title.value,
//                 content: content.value,
//                 price: price.value,
//                 //image: image.value,
//             });

//             console.log('Document successfully written!');
//         } catch (error) {
//             console.error('Error writing document:', error);
//         }
//     });
// }

const setUploadData = async () => {
    const date = new Date();
    const year = date.getFullYear();  // 연도
    const month = (date.getMonth() + 1).toString().padStart(2, '0');  // 월 (0부터 시작하므로 +1, 두 자릿수로 만들기)
    const day = date.getDate().toString().padStart(2, '0');  // 일 (두 자릿수로 만들기)
    const hours = date.getHours().toString().padStart(2, '0');  // 시간 (두 자릿수로 만들기)
    const minutes = date.getMinutes().toString().padStart(2, '0');  // 분 (두 자릿수로 만들기)
    const seconds = date.getSeconds().toString().padStart(2, '0');  // 초 (두 자릿수로 만들기)
    const formattedDate = `${year}${month}${day}`;
    const fullFormattedDate = `${formattedDate}${hours}${minutes}${seconds}`; 

    await setDoc(doc(db, 'trash', fullFormattedDate), {
        title: "변기",
        content: "응가",
        price: "1000",
        time: new Date(),
        //image: image.value,
    });
};

// const searchMaxId = async () => {
//     // 'myCollection' 컬렉션에서 id 필드를 기준으로 내림차순 정렬 후 첫 번째 문서를 가져옵니다.
//     db.collection('myCollection')
//     .orderBy('id', 'desc')
//     .limit(1)
//     .get()
//     .then((querySnapshot) => {
//     if (!querySnapshot.empty) {
//         const maxId = querySnapshot.docs[0].data().id;
//         console.log('최대 id:', maxId);
//     } else {
//         console.log('컬렉션이 비어있습니다.');
//     }
//     })
//     .catch((error) => {
//     console.error('쿼리 실패:', error);
//     });
// }

// const updateUserName = () => {
//     firebase.auth().currentUser.updateProfile({
//         displayName: "원하는 이름"
//     }).then(function() {
//         // 업데이트 성공 시
//         console.log("프로필 업데이트 완료");
//     }).catch(function(error) {
//         // 오류 처리
//         console.error("프로필 업데이트 실패:", error);
//     });  
// }


  

// const searchUsers = async () => {
//     try {
//       const querySnapshot = await getDocs(collection(db, 'product'))
//       querySnapshot.forEach((doc) => {
//         console.log(doc.id, '=>', doc.data())
//       })
//     } catch (error) {
//       console.error('Error fetching data:', error)
//     }
// }

function Upload() {
    const [userName, setUserName] = useState("");

    useEffect(() => {    
        // 현재 접속 사용자 정보
        const auth = getAuth();
        const user = auth.currentUser;

        if (user) {
            console.log(user.uid);  // 사용자 UID
        } else {
            console.log('User is not logged in.');
        }

        // 사용자가 로그인한 후 이름을 네비게이션 바에 표시하는 함수 예시
        async function displayUserName() {
            const auth = getAuth();
            const user = auth.currentUser;
            
            if (!user) {
                console.error('User is not logged in.');
                return;
            }
            const docRef = doc(db, "users", user.uid);
            const docSnap = await getDoc(docRef);
            const userData = docSnap.data();
            setUserName(userData?.displayName);
            // 네비게이션 바의 특정 요소(예: id="user-name")에 이름을 표시합니다.
            if (docSnap) {
                // 사용자 이름이 없는 경우 기본값 사용
                setUserName(userData?.displayName || "사용자");
            } else {
                setUserName('User is not logged in.');
            }
        }

        displayUserName();


        
        // const addUploadData = async () => {
        //     // 머임?? add doc은 collection에다가 데이터를 추가하는 것이네?? document에 뭘 설정을 못하네??
        //     await addDoc(collection(db, 'trash'), {
        //         title: "변기",
        //         content: "응가",
        //         price: "1000",
        //         time: new Date(),
        //         //image: image.value,
        //     });
        // };
    }, []);

    return (
        <>  
            <div style={{display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100px' , border : '1px solid black'}}>
                <div>{userName}</div>
                <input type="text" className="form-control mt-2" id="price" placeholder="price" />
                <button className="btn btn-danger mt-3" id="send" onClick={ () => setUploadData() } >이름 변경</button>
            </div>

            <div style={{display: 'flex', justifyContent: 'center', alignItems: 'center', height: '200px', border : '1px solid black'}}>
                <div>상품 등록</div>
                <div className="uploader mt-3" >
                    <input type="text" className="form-control mt-2" id="title" placeholder="title" />
                    <textarea className="form-control mt-2" id="content">content</textarea>
                    <input type="text" className="form-control mt-2" id="price" placeholder="price" />
                    {/* <input className="form-control mt-2" type="file" id="image" /> */}
                    <button className="btn btn-danger mt-3" id="send" onClick={ () => setUploadData() } >올리기</button>
                </div>
            </div>
        </>
    );
}

export default Upload;
