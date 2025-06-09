import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import Header from "../components/Header";
import Footer from "../components/Footer";
import "../styles/LoginPage.css";

const LoginPage = () => {
  const [userid, setUserid] = useState("");
  const [password, setPassword] = useState("");
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    try {
      const response = await fetch("http://localhost:8080/api/auth/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          userid,
          password,
        }),
      });

      const data = await response.json();

      if (response.ok) {
        // 로그인 상태를 localStorage에 저장
        localStorage.setItem('isLoggedIn', 'true');
        // 사용자 ID도 저장 (필요한 경우 사용)
        localStorage.setItem('userid', userid);
        navigate("/main");
      } else {
        alert(data.message || "로그인에 실패했습니다.");
      }
    } catch (error) {
      console.error("Login error:", error);
      alert("로그인 중 오류가 발생했습니다.");
    }
  };

  const goToSignup = () => {
    navigate("/signup");
  };

  return (
    <div className="login-page">
      <Header />

      <div className="login-container">
        <div className="login-box">
          <div className="welcome-text">
            <h2>안녕하세요.</h2>
            <h2>Software 레스토랑입니다.</h2>
            <p>예약 서비스를 이용하시려면 로그인 해주세요.</p>
          </div>

          <form onSubmit={handleLogin}>
            <input
              type="text"
              placeholder="아이디"
              value={userid}
              onChange={(e) => setUserid(e.target.value)}
              required
            />
            <input
              type="password"
              placeholder="비밀번호"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
            <button type="submit">로그인</button>
          </form>

          <button className="signup-btn" onClick={goToSignup}>
            회원가입
          </button>
        </div>
      </div>

      <Footer />
    </div>
  );
};

export default LoginPage;
