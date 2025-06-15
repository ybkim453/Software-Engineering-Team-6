// Cancel.jsx

import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import checkIcon from '../assets/check_icon.png';
import '../styles/Cancel.css';
import CancelError from './layout/Cancel/Error';
import CancelContinue from './layout/Cancel/Cancel_Continue';
import CancelSuccess from './layout/Cancel/Cancel_Success';

const Cancel = ({ reservationData, onClose }) => {
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);
  const [reservationDetails, setReservationDetails] = useState(null);
  const [showError, setShowError] = useState(false);
  const [showContinue, setShowContinue] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [errorType, setErrorType] = useState('');

  useEffect(() => {
    const fetchReservationDetails = async () => {
      // reservationData prop이 유효한지 먼저 확인
      // 'date', 'timeSlot', 'tableNumber' 키
      if (!reservationData || !reservationData.date || !reservationData.timeSlot || !reservationData.tableNumber) {
        console.warn('예약 상세 정보를 가져올 때 예약 데이터가 불완전하거나 null입니다:', reservationData);
        setErrorType('missing_reservation_info');
        setShowError(true);
        return; // 유효하지 않은 데이터면 요청을 보내지 않고 종료
      }

      // 백엔드 API가 기대하는 키 이름으로 페이로드 구성
      const payload = {
        date: reservationData.date,
        timeSlot: reservationData.timeSlot,
        tableNumber: reservationData.tableNumber
      };

      console.log('상세 정보 요청 페이로드 전송:', payload);

      try {
        const response = await fetch(`http://localhost:8080/api/reservations/details`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(payload),
        });

        if (response.ok) {
          const data = await response.json();
          console.log('예약 상세 정보 수신:', data);
          setReservationDetails(data);
        } else {
          const errorData = await response.json();
          console.error('예약 상세 정보를 가져오지 못했습니다:', errorData.message || response.statusText);
          setErrorType('fetch_details_failed');
          setShowError(true);
        }
      } catch (error) {
        console.error('예약 상세 정보를 가져오는 중 오류 발생:', error);
        setErrorType('network_error');
        setShowError(true);
      }
    };

    fetchReservationDetails();
  }, [reservationData]);

  const handleClose = () => {
    onClose();
  };

  const checkCancellationEligibility = () => {
    if (!reservationDetails) {
      setErrorType('no_details_fetched');
      setShowError(true);
      return false;
    }

    const currentUserId = localStorage.getItem('userid');
    console.log('현재 사용자 ID:', currentUserId);
    console.log('예약 사용자 ID:', reservationDetails.userid);
    
    if (reservationDetails.userid !== currentUserId) {
      setErrorType('unauthorized');
      setShowError(true);
      return false;
    }

    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    const reservationDate = new Date(reservationData.date);
    reservationDate.setHours(0, 0, 0, 0);

    const timeDiff = reservationDate.getTime() - today.getTime();
    const daysDiff = timeDiff / (1000 * 3600 * 24);

    if (daysDiff <= 1) {
      setErrorType('invalid_date');
      setShowError(true);
      return false;
    }

    return true;
  };

  const handleCancelClick = () => {
    if (checkCancellationEligibility()) {
      setShowContinue(true);
    }
  };

  const handleCancelConfirm = async () => {
    setIsLoading(true);
    try {
      // 백엔드 API가 기대하는 키 이름으로 페이로드 구성
      const payload = {
        date: reservationData.date,
        timeSlot: reservationData.timeSlot,
        tableNumber: reservationData.tableNumber
      };

      console.log('취소 요청 페이로드 전송:', payload);

      const response = await fetch(`http://localhost:8080/api/reservations/cancel`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      });

      if (response.ok) {
        setShowSuccess(true);
        setShowContinue(false);
      } else {
        const data = await response.json();
        alert(data.message || '예약 취소에 실패했습니다.');
      }
    } catch (error) {
      console.error('예약 취소 중 오류 발생:', error);
      alert('예약 취소 중 오류가 발생했습니다.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSuccessClose = () => {
    onClose();
    window.location.reload();
  };

  if (showError) {
    return <CancelError onClose={handleClose} errorType={errorType} />;
  }

  if (showContinue) {
    return <CancelContinue onConfirm={handleCancelConfirm} onClose={onClose} />;
  }

  if (showSuccess) {
    return <CancelSuccess onClose={handleSuccessClose} />;
  }

  return (
    <div className="cancel-modal-overlay">
      <div className="cancel-modal-container">
        <button className="cancel-close-button" onClick={handleClose}>×</button>
        
        <div className="cancel-header">
          <img src={checkIcon} alt="체크 아이콘" className="cancel-icon" />
          <div className="cancel-info">
            <div className="cancel-title">예약정보</div>
            <div className="cancel-details">
              {reservationDetails && (
                <>
                  <p>예약자: {reservationDetails.customerName}</p>
                  <p>날짜: {reservationData.date}</p>
                  <p>시간: {reservationData.timeSlot === 'lunch' ? '점심' : '저녁'}</p>
                  <p>테이블: {reservationData.tableNumber}번</p>
                </>
              )}
            </div>
          </div>
        </div>
        
        <div className="cancel-buttons">
          <button 
            className="cancel-reservation-button" 
            onClick={handleCancelClick}
            disabled={isLoading || !reservationDetails}
          >
            {isLoading ? '취소 중...' : '예약 취소하기'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default Cancel;