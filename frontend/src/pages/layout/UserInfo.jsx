import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import '../../styles/layout/UserInfo.css';

const UserInfo = ({ isOpen, onClose }) => {
  const [userData, setUserData] = useState(null);
  const navigate = useNavigate();
  const location = useLocation();

  const isLoginPage = location.pathname === '/login' || location.pathname === '/signup';
  const isLoggedIn = localStorage.getItem('isLoggedIn') === 'true';

  useEffect(() => {
    if (!isLoginPage && isLoggedIn) {
      const userid = localStorage.getItem('userid');
      if (userid) {
        fetchUserData(userid);
      }
    }
  }, [isLoginPage, isLoggedIn]);

  const fetchUserData = async (userid) => {
    try {
      const response = await fetch(`http://localhost:8080/api/auth/user/${userid}`);
      if (response.ok) {
        const data = await response.json();
        setUserData(data);
      }
    } catch (error) {
      console.error('Error fetching user data:', error);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('isLoggedIn');
    localStorage.removeItem('userid');
    navigate('/login');
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="user-info-modal">
      <div className="user-info-content">
        <button className="user-info-close-btn" onClick={onClose}>×</button>
        
        {isLoginPage || !isLoggedIn ? (
          <div className="user-info-message">로그인 해주세요.</div>
        ) : userData ? (
          <>
            <h2 className="user-info-greeting">
              안녕하세요,<br/>{userData.userid}님!
            </h2>
            <div className="user-info-details">
              <p>이름: {userData.name}</p>
              <p>이메일: {userData.email}</p>
              <p>전화번호: {userData.phone}</p>
            </div>
            <button className="user-info-logout-btn" onClick={handleLogout}>
              로그아웃
            </button>
          </>
        ) : (
          <div className="user-info-message">잠시만 기다려주세요...</div>
        )}
      </div>
    </div>
  );
};

export default UserInfo; 