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
      try {
        const response = await fetch(`http://localhost:8080/api/reservations/details`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            date: reservationData.date,
            timeSlot: reservationData.timeSlot,
            tableNumber: reservationData.tableNumber
          }),
        });

        if (response.ok) {
          const data = await response.json();
          console.log('Reservation details:', data); // 디버깅용
          setReservationDetails(data);
        } else {
          console.error('Failed to fetch reservation details');
        }
      } catch (error) {
        console.error('Error fetching reservation details:', error);
      }
    };

    fetchReservationDetails();
  }, [reservationData]);

  const handleClose = () => {
    onClose();
  };

  const checkCancellationEligibility = () => {
    if (!reservationDetails) return false;

    // 현재 로그인한 사용자의 ID
    const currentUserId = localStorage.getItem('userid');
    console.log('Current user ID:', currentUserId); // 디버깅용
    console.log('Reservation userid:', reservationDetails.userid); // 디버깅용
    
    // 예약자 ID와 현재 사용자 ID 비교
    if (reservationDetails.userid !== currentUserId) {
      setErrorType('unauthorized');
      setShowError(true);
      return false;
    }

    // 날짜 체크
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const reservationDate = new Date(reservationData.date);
    reservationDate.setHours(0, 0, 0, 0);

    const timeDiff = reservationDate.getTime() - today.getTime();
    const daysDiff = timeDiff / (1000 * 3600 * 24);

    if (daysDiff <= 1) {  // 하루 이상 남지 않은 경우
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
      const response = await fetch(`http://localhost:8080/api/reservations/cancel`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          date: reservationData.date,
          timeSlot: reservationData.timeSlot,
          tableNumber: reservationData.tableNumber
        }),
      });

      if (response.ok) {
        setShowSuccess(true);
        setShowContinue(false);
      } else {
        const data = await response.json();
        alert(data.message || '예약 취소에 실패했습니다.');
      }
    } catch (error) {
      console.error('Error canceling reservation:', error);
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
          <img src={checkIcon} alt="엑스" className="cancel-icon" />
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
