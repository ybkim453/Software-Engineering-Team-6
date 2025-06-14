// src/components/UserInfo.jsx
import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import '../../styles/layout/UserInfo.css';
import closeIcon from '../../assets/X_icon.png'; // 닫기 아이콘 이미지

const UserInfo = ({ isOpen, onClose }) => {
  const [userData, setUserData] = useState(null);
  const navigate = useNavigate();
  const location = useLocation();

  const isLoginPage = location.pathname === '/login' || location.pathname === '/signup';
  const isLoggedIn = localStorage.getItem('isLoggedIn') === 'true';

  useEffect(() => {
    if (isOpen && !isLoginPage && isLoggedIn) {
      const userid = localStorage.getItem('userid');
      if (userid) {
        fetchUserData(userid);
      }
    } else {
      setUserData(null);
    }
  }, [isOpen, isLoginPage, isLoggedIn]);

  const fetchUserData = async (userid) => {
    try {
      const response = await fetch(`http://localhost:8080/api/auth/user/${userid}`);
      if (response.ok) {
        const data = await response.json();
        setUserData(data);
      } else {
        console.error('Failed to fetch user data:', response.status);
        setUserData(null);
      }
    } catch (error) {
      console.error('Error fetching user data:', error);
      setUserData(null);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('isLoggedIn');
    localStorage.removeItem('userid');
    navigate('/login');
    onClose();
  };

  const handleGoToReservations = () => {
    navigate('/my-reservations');
    onClose();
  };

  // 모달 오버레이 클릭 핸들러
  const handleOverlayClick = (e) => {
    // 이벤트의 target이 모달 오버레이 자신인 경우에만 닫기
    // 이렇게 하면 모달 내용 클릭 시에는 닫히지 않습니다.
    if (e.target.className === 'user-info-overlay') {
      onClose();
    }
  };

  // 모달 콘텐츠 내부 클릭 시 이벤트 버블링 방지
  const handleContentClick = (e) => {
    e.stopPropagation();
  };

  if (!isOpen) return null;

  return (
    <div className="user-info-overlay" onClick={handleOverlayClick}> {/* 오버레이 클릭 시 닫기 */}
      <div className="user-info-modal" onClick={handleContentClick}> {/* 모달 콘텐츠 클릭 시 버블링 방지 */}
        <button className="user-info-close-btn" onClick={onClose}>
          <img src={closeIcon} alt="닫기" />
        </button>
        
        {isLoginPage || !isLoggedIn ? (
          <div className="user-info-message">로그인이 필요합니다.</div>
        ) : userData ? (
          <>
            <div className="user-info-greeting">
              안녕하세요<br/>{userData.name || userData.userid}님!
            </div>
            
            <div className="user-info-details">
              <p>e-mail: {userData.email}</p>
              <p>전화번호: {userData.phone}</p>
            </div>

            <div className="user-info-divider"></div>

            <button className="user-info-reservations-btn" onClick={handleGoToReservations}>
              예약 목록
            </button>
            <button className="user-info-logout-btn" onClick={handleLogout}>
              로그아웃
            </button>
          </>
        ) : (
          <div className="user-info-message">사용자 정보를 불러오는 중입니다...</div>
        )}
      </div>
    </div>
  );
};

export default UserInfo;