import * as React from 'react';
// import kakao from "@images/icon/kakao.svg";

import axios from 'axios';
import queryString from 'query-string';
import { useDispatch } from "react-redux";
import { useNavigate } from "react-router-dom";
// import { setEmail } from '../../store/user';
import { setEmail, setUserInfo } from '../../store/user';
// import { getUserInfo, getKakaoToken, kakaoLogin } from "../../apis/user";
import { getUserInfo } from "../../apis/user";

function KakaoLogin () {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const query = queryString.parse(window.location.search);
 
  const getKakaoTokenHandler = async (code1) => {
    const data = {    
      grant_type: "authorization_code",
      client_id: 'ecf0cdf8c6d0f9625b2d33d19a397c94',
      redirect_uri: "http://localhost:3000/kakao",
      code: code1,
      client_secret: "g7n0SEsnPEWUjIUCMdUMzBPPZlbhW0Vo"
    };
    const qString = Object.keys(data).map((k)=> `${encodeURIComponent(k)}=${encodeURIComponent(data[k])}`).join('&');
    axios.post('https://kauth.kakao.com/oauth/token', qString, {
      headers: {
        'Content-type': 'application/x-www-form-urlencoded;charset=utf-8'
      }
    }).then((res) => {
      console.log(res.data.access_token)
      axios.post('http://i7C109.p.ssafy.io:8081/social/kakao', {Authorization: res.data.access_token})
      .then(res1 => {
        console.log(res1);
        // 로그인 작업
        // 리덕스 스토어에 이메일 저장
        dispatch(setEmail({email: res1.data.email}))
        // 세션스토리지에 토큰 저장
        sessionStorage.setItem("refreshToken", res1.data.refreshToken);
        sessionStorage.setItem("accessToken", res.data.Authorization);
        // 유저 정보 가져오기
        // console.log("유저 정보 가져오기")
        const userRes = getUserInfo(res1.data.email);
        // console.log(userRes.userInfo);
        // 유저 정보 스토어에 저장
        dispatch(setUserInfo(userRes.userInfo))
        // navigate("/");
      })
      navigate("/");
      // .catch(err => {
      //   console.log(err);
      //   navigate("/",{ replace: true});
      //   navigate("/login");
      // });

      
    });
  };

  React.useEffect(() => {  
    if (query.code) {
      getKakaoTokenHandler(query.code.toString());
    }
  }, []);

  return (
    <div>
      스피너 모양
    </div>
  );
};
export default KakaoLogin;