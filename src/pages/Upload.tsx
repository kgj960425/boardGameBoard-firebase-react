import './Upload.css';
import { db } from '../pages/firebase';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { SetStateAction, useEffect, useState } from 'react';
import { getAuth } from 'firebase/auth';

function Upload() {
    const [userName, setUserName] = useState("");
    const [updateUserName, setUpdateUserName] = useState("");

    const saveUserName = (event: { target: { value: SetStateAction<string>; }; }) => {
        setUpdateUserName(event.target.value);
        console.log(updateUserName);
    };

    // const setUploadData = async () => {
    //     const date = new Date();
    //     const year = date.getFullYear();  // 연도
    //     const month = (date.getMonth() + 1).toString().padStart(2, '0');  // 월 (0부터 시작하므로 +1, 두 자릿수로 만들기)
    //     const day = date.getDate().toString().padStart(2, '0');  // 일 (두 자릿수로 만들기)
    //     const hours = date.getHours().toString().padStart(2, '0');  // 시간 (두 자릿수로 만들기)
    //     const minutes = date.getMinutes().toString().padStart(2, '0');  // 분 (두 자릿수로 만들기)
    //     const seconds = date.getSeconds().toString().padStart(2, '0');  // 초 (두 자릿수로 만들기)
    //     const formattedDate = `${year}${month}${day}`;
    //     const fullFormattedDate = `${formattedDate}${hours}${minutes}${seconds}`; 

    //     await setDoc(doc(db, 'trash', fullFormattedDate), {
    //         title: "변기",
    //         content: "응가",
    //         price: "1000",
    //         time: new Date(),
    //         //image: image.value,
    //     });
    // };

    const updateMyDisplayName = async () => {
        // 현재 접속 사용자 정보
        const auth = getAuth();
        const user = auth.currentUser;
        
        if (!user) {
            console.error('User is not logged in.');
            return;
        }

        try {
            await setDoc(doc(db, 'A.users', user.uid), {
                displayName: updateUserName,
                updateDttm: new Date(),
                uddateUser: user.uid,
            });

            setUserName(updateUserName);
            alert('Document successfully updated!');
        }
        catch (e) {
            console.error('Error updating document:', e);
        }
    };


    useEffect(() => {    
        
        // 사용자가 로그인한 후 이름을 네비게이션 바에 표시하는 함수 예시
        async function displayUserName() {
            // 현재 접속 사용자 정보
            const auth = getAuth();
            const user = auth.currentUser;
            
            if (!user) {
                console.error('User is not logged in.');
                return;
            }
            const docSnap = await getDoc(doc(db, "A.users", user.uid));
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
                <input type="text" className="form-control mt-2" id="myName" value={updateUserName} onChange={saveUserName} placeholder={userName} />
                <button className="btn btn-danger mt-3" id="send" onClick={ () => updateMyDisplayName() } >이름 변경</button>
            </div>

            {/* <div style={{display: 'flex', justifyContent: 'center', alignItems: 'center', height: '200px', border : '1px solid black'}}>
                <div>상품 등록</div>
                <div className="uploader mt-3" >
                    <input type="text" className="form-control mt-2" id="title" placeholder="title" />
                    <textarea className="form-control mt-2" id="content">content</textarea>
                    <input type="text" className="form-control mt-2" id="price" placeholder="price" />
                    <input className="form-control mt-2" type="file" id="image" />
                    <button className="btn btn-danger mt-3" id="send" onClick={ () => setUploadData() } >올리기</button>
                </div>
            </div> */}
        </>
    );
}

export default Upload;
