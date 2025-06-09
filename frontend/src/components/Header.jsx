import React, { useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import "../styles/Header.css";
import personIcon from "../assets/person_icon.png";
import UserInfo from "../pages/layout/UserInfo";

const Header = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [isUserInfoOpen, setIsUserInfoOpen] = useState(false);

  const handleTitleClick = () => {
    // 현재 페이지가 로그인 또는 회원가입 페이지인 경우
    if (location.pathname === '/login' || location.pathname === '/signup') {
      navigate('/login');
    } else {
      // 그 외의 모든 페이지에서는 메인 페이지로 이동
      navigate('/main');
    }
  };

  return (
    <header className="app-header">
      <div 
        className="title" 
        onClick={handleTitleClick}
        style={{ cursor: 'pointer' }}
      >
        Software Restaurant
      </div>
      <div 
        className="icon" 
        onClick={() => setIsUserInfoOpen(true)}
        style={{ cursor: 'pointer' }}
      >
        <img src={personIcon} alt="사용자 아이콘" />
      </div>
      {isUserInfoOpen && (
        <UserInfo 
          isOpen={isUserInfoOpen} 
          onClose={() => setIsUserInfoOpen(false)} 
        />
      )}
    </header>
  );
};

export default Header;
