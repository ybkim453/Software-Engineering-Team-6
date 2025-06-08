import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import Header from "../components/Header";
import Footer from "../components/Footer";
import "../styles/SignupPage.css";

const SignupPage = () => {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    userid: "",
    password: "",
  });

  const [isIdChecked, setIsIdChecked] = useState(false);
  const [isIdAvailable, setIsIdAvailable] = useState(false);

  const navigate = useNavigate();

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
    
    // 아이디가 변경되면 중복확인 상태 초기화
    if (name === "userid") {
      setIsIdChecked(false);
      setIsIdAvailable(false);
    }
  };

  const checkDuplicate = async () => {
    if (!formData.userid) {
      alert("아이디를 입력해주세요.");
      return;
    }

    try {
      const response = await fetch("http://localhost:8080/api/auth/check-userid", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ userid: formData.userid }),
      });

      const data = await response.json();
      setIsIdChecked(true);

      if (response.ok) {
        if (data.available) {
          setIsIdAvailable(true);
          alert("사용 가능한 아이디입니다.");
        } else {
          setIsIdAvailable(false);
          alert("이미 존재하는 아이디입니다.");
          setFormData(prev => ({
            ...prev,
            userid: ""
          }));
        }
      } else {
        alert("중복 확인 중 오류가 발생했습니다.");
      }
    } catch (error) {
      console.error("Duplicate check error:", error);
      alert("서버 연결 오류가 발생했습니다.");
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // 모든 필드가 입력되었는지 확인
    if (!formData.name || !formData.email || !formData.phone || 
        !formData.userid || !formData.password) {
      alert("모든 정보를 입력해주세요.");
      return;
    }

    // 아이디 중복확인이 완료되었는지 확인
    if (!isIdChecked || !isIdAvailable) {
      alert("아이디 중복확인을 완료해주세요.");
      return;
    }

    try {
      const response = await fetch("http://localhost:8080/api/auth/signup", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      if (response.ok) {
        alert("회원가입이 완료되었습니다!");
        navigate("/login");
      } else {
        alert(data.message || "회원가입에 실패했습니다.");
      }
    } catch (error) {
      console.error("Signup error:", error);
      alert("회원가입 중 오류가 발생했습니다.");
    }
  };

  return (
    <div className="signup-page">
      <Header />
      <form onSubmit={handleSubmit} className="signup-form">
        <div className="input-group">
          <input
            type="text"
            name="name"
            placeholder="이름"
            value={formData.name}
            onChange={handleChange}
            required
          />
        </div>
        <div className="input-group">
          <input
            type="email"
            name="email"
            placeholder="이메일"
            value={formData.email}
            onChange={handleChange}
            required
          />
        </div>
        <div className="input-group">
          <input
            type="tel"
            name="phone"
            placeholder="전화번호"
            value={formData.phone}
            onChange={handleChange}
            required
          />
        </div>
        <div className="input-group">
          <input
            type="text"
            name="userid"
            placeholder="아이디"
            value={formData.userid}
            onChange={handleChange}
            required
          />
          <button type="button" className="check-button" onClick={checkDuplicate}>
            중복확인
          </button>
        </div>
        <div className="input-group">
          <input
            type="password"
            name="password"
            placeholder="비밀번호"
            value={formData.password}
            onChange={handleChange}
            required
          />
        </div>
        <button type="submit" className="signup-button">회원가입</button>
      </form>
      <Footer />
    </div>
  );
};

export default SignupPage; 