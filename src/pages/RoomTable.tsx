import { useEffect } from "react";
// import { db } from '../pages/firebase';
// import { collection, addDoc, serverTimestamp } from "firebase/firestore";

//player001
const RoomTable = () => {
  useEffect(() => {
    
  }, []);


  return (
    <div style={{ padding: '50px', width: '1220px', margin: '0 auto', background: `url('/path/to/cazino_table.jpg')` }}>
      <div style={{ height: '20px', color: 'red'}}></div>
      <div>
        <button
          className="btn-main"
          id="clkMakeRoom"
          type="button"
          style={{
            height: '38px',
            boxShadow: '0 0 30px 8px rgb(120 68 152 / 62%)',
            fontWeight: 'bold',
          }}
        >
          방만들기
        </button>
      </div>

      <div style={{ height: '10px' }}></div>
      <div id='roomTbody'>
        <table id="room-table" style={{ border : '1px solid black' , borderCollapse: 'collapse'}}>
          <thead>
            <tr>
              <th scope="col" style={{ width: '210px' }}>방제목</th>
              <th scope="col" style={{ width: '60px' }}>인원 수</th>
              <th scope="col" style={{ width: '65px' }}>게임상태</th>
              <th scope="col" style={{ width: '65px' }}>시간제한</th>
              <th scope="col" style={{ width: '65px' }}>맵</th>
              <th scope="col">확장</th>
              <th scope="col">특수</th>
              <th scope="col" style={{ width: '92px' }}>팬메이드</th>
              <th scope="col" style={{ width: '65px' }}></th>
            </tr>
          </thead>
          <tbody>
            <tr data-room-seq="643627">
              <td style={{ wordBreak: 'keep-all' }}>
                <span style={{ color: '#ff9041', fontSize: '11px' }}>랭크&nbsp;</span>1:1 하실분~~~
              </td>
              <td>1/2</td>
              <td>대기중</td>
              <td>30초</td>
              <td>엘리시움</td>
              <td style={{ wordBreak: 'keep-all' }}>금성,서곡,서곡2</td>
              <td style={{ wordBreak: 'keep-all' }}>프로모,업적확장,태양계단계(WGT),맵셔플,전체기업</td>
              <td style={{ wordBreak: 'keep-all' }}>업적&기업상,서곡,기업,패스파인더</td>
              <td>
                <button
                  className="btn-main"
                  type="button"
                  name="btn"
                  data-kickuid="0"
                  style={{ height: '24px' }}
                >
                  입장
                </button>
              </td>
            </tr>
            <tr id="hor-minimalist-c" data-room-seq="643626" style={{ height: '38px' }}>
              <td style={{ wordBreak: 'keep-all' }}>
                <span style={{ color: '#ff9041', fontSize: '11px' }}>랭크&nbsp;</span>홍보처
              </td>
              <td>2/2</td>
              <td>게임중</td>
              <td>30초</td>
              <td>타르시스</td>
              <td style={{ wordBreak: 'keep-all' }}>서곡,서곡2</td>
              <td style={{ wordBreak: 'keep-all' }}>없음</td>
              <td style={{ wordBreak: 'keep-all' }}>없음</td>
              <td></td>
            </tr>
            <tr id="hor-minimalist-c" data-room-seq="643625" style={{ height: '38px' }}>
              <td style={{ wordBreak: 'keep-all' }}>
                <span style={{ color: '#da64d6', fontSize: '11px' }}>나 홀로 화성에&nbsp;</span>맹그로브
              </td>
              <td>1/1</td>
              <td>게임중</td>
              <td>무제한</td>
              <td>랜덤</td>
              <td style={{ wordBreak: 'keep-all' }}>서곡</td>
              <td style={{ wordBreak: 'keep-all' }}>없음</td>
              <td style={{ wordBreak: 'keep-all' }}>없음</td>
              <td>
                <button className="btn-main" type="button" name="btnWacthing" style={{ height: '24px' }}>
                  관전
                </button>
              </td>
            </tr>
            <tr id="hor-minimalist-c" data-room-seq="643623" style={{ height: '38px' }}>
              <td style={{ wordBreak: 'keep-all' }}>
                <span style={{ color: '#da64d6', fontSize: '11px' }}>나 홀로 화성에&nbsp;</span>애틀란타 분지 연구실
              </td>
              <td>1/1</td>
              <td>게임중</td>
              <td>무제한</td>
              <td>랜덤</td>
              <td style={{ wordBreak: 'keep-all' }}>금성,서곡,서곡2</td>
              <td style={{ wordBreak: 'keep-all' }}>프로모,태양계단계(WGT),맵셔플,전체기업</td>
              <td style={{ wordBreak: 'keep-all' }}>없음</td>
              <td></td>
            </tr>
            <tr id="hor-minimalist-c" data-room-seq="643620" style={{ height: '38px' }}>
              <td style={{ wordBreak: 'keep-all' }}>
                <span style={{ color: '#da64d6', fontSize: '11px' }}>나 홀로 화성에&nbsp;</span>가축
              </td>
              <td>1/1</td>
              <td>게임중</td>
              <td>무제한</td>
              <td>랜덤</td>
              <td style={{ wordBreak: 'keep-all' }}>금성,서곡,서곡2</td>
              <td style={{ wordBreak: 'keep-all' }}>프로모,태양계단계(WGT),전체기업</td>
              <td style={{ wordBreak: 'keep-all' }}>없음</td>
              <td>
                <button className="btn-main" type="button" name="btnWacthing" style={{ height: '24px' }}>
                  관전
                </button>
              </td>
            </tr>
            <tr id="hor-minimalist-c" data-room-seq="643603" style={{ height: '38px' }}>
              <td style={{ wordBreak: 'keep-all' }}>
                <span style={{ color: '#da64d6', fontSize: '11px' }}>나 홀로 화성에&nbsp;</span>심부유정 발열
              </td>
              <td>1/1</td>
              <td>게임중</td>
              <td>무제한</td>
              <td>랜덤</td>
              <td style={{ wordBreak: 'keep-all' }}>서곡,서곡2</td>
              <td style={{ wordBreak: 'keep-all' }}>프로모</td>
              <td style={{ wordBreak: 'keep-all' }}>없음</td>
              <td></td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default RoomTable;
