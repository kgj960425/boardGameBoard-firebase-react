import './Store.css';
import { db } from '../pages/firebase';
import { doc, getDocs, getDoc, collection } from 'firebase/firestore';
import { useEffect, useState } from 'react';

interface Product {
    id: string;
    name: string;
    pay: number;
}

function Store() {
    const [products, setProducts] = useState<Product[]>([]);

    // 단일 문서 가져오기 (비동기 함수)
    const getSingleDocument = async () => {
        try {
            const docRef = doc(db, 'product', 'product1');
            const docSnap = await getDoc(docRef);

            if (docSnap.exists()) {
                console.log('Document data:', docSnap.data());
            }
        } catch (error) {
            console.error('Error fetching document:', error);
        }
    };

    // 컬렉션 가져오기 (비동기 함수)
    const getCollection = async () => {
        try {
            const querySnapshot = await getDocs(collection(db, 'product'));
            querySnapshot.forEach((doc) => {
                console.log("document: ", doc.id, '=>', doc.data());
            });
        } catch (error) {
            console.error('Error fetching data:', error);
        }
    };

    useEffect(() => {
        // getSingleDocument();
        getCollection();

        const fetchProducts = async () => {
            try {
                const querySnapshot = await getDocs(collection(db, "product"));
                const productList = querySnapshot.docs.map((doc) => {
                    const data = doc.data();
                    return {
                        id: doc.id,
                        name: data.name,
                        pay: data.pay,
                    };
                });

                setProducts(productList); // 가져온 데이터로 상태 업데이트
            } catch (error) {
                console.error("Error fetching products:", error);
            }
        };

        fetchProducts();
    }, []); // 빈 배열을 넣어야 한 번만 실행됨

    return (
        <div className="container mt-3">
            <h1>상품 목록</h1>
            {products.map((product) => (
                <div key={product.id} className="product">
                    <div className="thumbnail" style={{ backgroundImage: "url('https://placehold.co/600x400')" }}></div>
                    <div className="flex-grow-1 p-4">
                        <h5 className="title">{product.name}</h5>
                        <p className="date">{product.id}</p>
                        <p className="price">{product.pay} 원</p>
                    </div>
                </div>
            ))}
        </div>
    );
}

export default Store;
