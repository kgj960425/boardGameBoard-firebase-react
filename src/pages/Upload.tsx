import './Upload.css';
import { db } from '../pages/firebase';
import { doc, setDoc } from 'firebase/firestore';
import { useEffect } from 'react';



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

function Upload() {
    useEffect(() => {
    
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

        //addUploadData();

    }, []);

    return (
        <>  
            <h1>상품 등록</h1>
            <div className="uploader mt-3">
                <input type="text" className="form-control mt-2" id="title" placeholder="title" />
                <textarea className="form-control mt-2" id="content">content</textarea>
                <input type="text" className="form-control mt-2" id="price" placeholder="price" />
                {/* <input className="form-control mt-2" type="file" id="image" /> */}
                <button className="btn btn-danger mt-3" id="send" onClick={ () => setUploadData() } >올리기</button>
            </div>
        </>
    );
}

export default Upload;
