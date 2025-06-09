import React from 'react';
import { useNavigate } from 'react-router-dom';
import checkIcon from '../../assets/check_icon.png';
import '../../styles/layout/Reservation_Success.css';

const ReservationSuccess = ({ reservationData, onClose }) => {
  const navigate = useNavigate();

  const handleClose = () => {
    onClose();
    navigate('/main');
  };

  return (
    <div className="modal-overlay">
      <div className="modal-container">
        <button className="close-button" onClick={handleClose}>×</button>
        
        <div className="success-header">
          <img src={checkIcon} alt="체크" className="success-icon" />
          <div className="success-info">
            <div className="reservation-success-title">예약완료<br></br>{reservationData.customerName}님 외 {reservationData.guestCount - 1}명</div>
            <div className="reservation-success-date">
              {reservationData.reservationDate}
            </div>
            <div className="reservation-success-details">
              {reservationData.timeSlot === 'lunch' ? '점심' : '저녁'} 시간대, {reservationData.tableNumber}번 테이블
            </div>
            <div className="success-phone-number">
              전화번호: {reservationData.phoneNumber}
            </div>
        
            <div className="success-message">
                위의 정보로 예약이 완료되었습니다.
            </div>
          </div>
        </div>
        
        <button className="close-modal-button" onClick={handleClose}>
          닫기
        </button>
      </div>
    </div>
  );
};

export default ReservationSuccess;
