import { useEffect, useState } from "react";
import { auth } from "../firebase/firebase";
import { updateProfile } from "firebase/auth";
import "./UserProfileEditor.css";

export default function UserProfileEditor() {
    const [displayName, setDisplayName] = useState("");
    const [photoURL, setPhotoURL] = useState("");
    const [email, setEmail] = useState("");
    const [emailVerified, setEmailVerified] = useState(false);
    const [uid, setUid] = useState("");
    const [message, setMessage] = useState("");

    useEffect(() => {
        const user = auth.currentUser;
        if (user) {
            setDisplayName(user.displayName ?? "");
            setPhotoURL(user.photoURL ?? "");
            setEmail(user.email ?? "");
            setEmailVerified(user.emailVerified);
            setUid(user.uid);
        }
    }, []);

    const handleUpdate = async () => {
        const user = auth.currentUser;
        if (user) {
            try {
                await updateProfile(user, { displayName, photoURL });
                setMessage("✅ 사용자 정보가 성공적으로 업데이트되었습니다.");
            } catch (err) {
                console.error(err);
                setMessage("❌ 업데이트 중 오류가 발생했습니다.");
            }
        }
    };

    return (
        <div className="profile-container">
            <div className="profile-header">
                <div>
                    <h2>{email}</h2>
                    <p>Firebase UID: {uid}</p>
                </div>
            </div>

            <div className="profile-content">
                <div className="profile-photo">
                    <div className="photo-wrapper">
                        <img
                            src={
                                photoURL ||
                                "https://cdn-icons-png.flaticon.com/512/847/847969.png"
                            }
                            alt="Profile"
                        />
                        <label className="photo-edit">📷</label>
                    </div>
                </div>

                <div className="profile-form">
                    <div className="form-row">
                        <label>이름 (표시 이름)</label>
                        <input
                            type="text"
                            value={displayName}
                            onChange={(e) => setDisplayName(e.target.value)}
                            maxLength={20}
                            placeholder="이름을 입력하세요"
                            required
                        />
                    </div>

                    <div className="form-row">
                        <label>프로필 사진 URL</label>
                        <input
                            type="text"
                            value={photoURL}
                            onChange={(e) => setPhotoURL(e.target.value)}
                            placeholder="https://github.com/{id}.jpg"
                        />
                        <div className="url-explanation">
                        unsplash 에서 제공 받은 url 기입 혹은 본인 github 프로필 사진 설정 후 예시 url과 같이 id를 넣어서 설정시 github의 프로필 사진 사용 가능
                        </div>
                    </div>

                    <div className="form-row flex-between">
                        <label>이메일 인증 여부</label>
                        <div>{emailVerified ? "✅ 인증됨" : "❌ 미인증"}</div>
                        <div className="verify-status-with-button">
                            <button className="btn confirm" onClick={handleUpdate}>
                                수정
                            </button>
                        </div>
                    </div>

                    {message && <div className="form-message">{message}</div>}
                </div>
            </div>
        </div>
    );
}
