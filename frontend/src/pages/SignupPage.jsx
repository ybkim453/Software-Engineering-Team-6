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

  const [errors, setErrors] = useState({
    name: false,
    email: false,
    phone: false,
    userid: false,
    password: false,
  });

  const errorMessages = {
    name: "이름을 정확히 입력해 주세요.",
    email: "이메일을 형식에 맞게 정확히 입력해 주세요.",
    phone: "전화번호를 정확히 입력해 주세요.",
    userid: "영문자, 숫자 조합 최소 6자리 이상의 아이디를 정확히 입력해 주세요.",
    password: "영문자, 숫자, 특수문자 조합 최소 8자리 이상의 비밀번호를 정확히 입력해 주세요.",
  };

  const [isIdChecked, setIsIdChecked] = useState(false);
  const [isIdAvailable, setIsIdAvailable] = useState(false);

  const navigate = useNavigate();

  const validateField = (name, value) => {
    switch (name) {
      case 'userid':
        return /^(?=.*[a-zA-Z])(?=.*\d)[a-zA-Z0-9]{6,}$/.test(value);
      case 'password':
        return /^(?=.*[A-Za-z])(?=.*\d)(?=.*[@$!%*#?&])[A-Za-z\d@$!%*#?&]{8,}$/.test(value);
      case 'email':
        return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
      default:
        return value.trim() !== '';
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    
    if (name === "userid") {
      setIsIdChecked(false);
      setIsIdAvailable(false);
    }

    // 입력이 있으면 에러 상태 제거
    if (value.trim()) {
      setErrors(prev => ({
        ...prev,
        [name]: false
      }));
    }
  };

  const checkDuplicate = async () => {
    if (!formData.userid || !validateField('userid', formData.userid)) {
      setErrors(prev => ({
        ...prev,
        userid: true
      }));
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

    // 모든 필드 유효성 검사
    const newErrors = {};
    Object.keys(formData).forEach(field => {
      newErrors[field] = !validateField(field, formData[field]);
    });

    setErrors(newErrors);

    // 에러가 있으면 제출하지 않음
    if (Object.values(newErrors).some(error => error)) {
      return;
    }

    // 아이디 중복확인 체크
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
      <form onSubmit={handleSubmit} className="signup-form" noValidate>
        <h2>Software Restaurant 계정 만들기</h2>
        <div className={`input-group ${errors.name ? 'error' : ''}`}>
          <input
            type="text"
            name="name"
            placeholder="이름"
            value={formData.name}
            onChange={handleChange}
          />
          {errors.name && (
            <div className="error-message">
              <i className="error-icon">!</i>
              {errorMessages.name}
            </div>
          )}
        </div>
        <div className={`input-group ${errors.email ? 'error' : ''}`}>
          <input
            type="email"
            name="email"
            placeholder="이메일"
            value={formData.email}
            onChange={handleChange}
          />
          {errors.email && (
            <div className="error-message">
              <i className="error-icon">!</i>
              {errorMessages.email}
            </div>
          )}
        </div>
        <div className={`input-group ${errors.phone ? 'error' : ''}`}>
          <input
            type="tel"
            name="phone"
            placeholder="전화번호"
            value={formData.phone}
            onChange={handleChange}
          />
          {errors.phone && (
            <div className="error-message">
              <i className="error-icon">!</i>
              {errorMessages.phone}
            </div>
          )}
        </div>
        <div className={`input-group ${errors.userid ? 'error' : ''}`}>
          <input
            type="text"
            name="userid"
            placeholder="아이디 (영문, 숫자 조합 6자 이상)"
            value={formData.userid}
            onChange={handleChange}
          />
          <button type="button" className="check-button" onClick={checkDuplicate}>
            중복확인
          </button>
          {errors.userid && (
            <div className="error-message">
              <i className="error-icon">!</i>
              {errorMessages.userid}
            </div>
          )}
        </div>
        <div className={`input-group ${errors.password ? 'error' : ''}`}>
          <input
            type="password"
            name="password"
            placeholder="비밀번호 (영문, 숫자, 특수문자 조합 8자 이상)"
            value={formData.password}
            onChange={handleChange}
          />
          {errors.password && (
            <div className="error-message">
              <i className="error-icon">!</i>
              {errorMessages.password}
            </div>
          )}
        </div>
        <button type="submit" className="signup-button">회원가입</button>
      </form>
      <Footer />
    </div>
  );
};

export default SignupPage; 