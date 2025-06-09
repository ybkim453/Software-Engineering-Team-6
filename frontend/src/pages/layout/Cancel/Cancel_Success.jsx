import React from 'react';
import successIcon from '../../../assets/check_icon.png';
import '../../../styles/layout/Cancel/Cancel_Success.css';

const CancelSuccess = ({ onClose }) => {
  return (
    <div className="cancel-success-modal-overlay">
      <div className="cancel-success-modal-container">
        <button className="cancel-success-close-button" onClick={onClose}>×</button>
        
        <div className="cancel-success-content">
          <div className="cancel-success-header">
            <img src={successIcon} alt="성공" className="cancel-success-icon" />
            <span className="cancel-success-title">Cancel Success!</span>
          </div>
          
          <div className="cancel-success-message">
            해당 테이블 예약이 취소되었습니다.
          </div>
          
          <button className="cancel-success-close-modal-button" onClick={onClose}>
            닫기
          </button>
        </div>
      </div>
    </div>
  );
};

export default CancelSuccess;
