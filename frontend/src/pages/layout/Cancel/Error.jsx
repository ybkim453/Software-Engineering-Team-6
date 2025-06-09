import React from 'react';
import errorIcon from '../../../assets/X_icon.png';
import '../../../styles/layout/Cancel/Error.css';

const CancelError = ({ onClose, errorType }) => {
  const getErrorMessage = () => {
    switch (errorType) {
      case 'unauthorized':
        return '본인의 예약만 취소 가능합니다.';
      case 'invalid_date':
        return '예약은 최소 하루 전까지 취소가 가능합니다.';
      default:
        return '예약 취소가 불가능합니다.';
    }
  };

  return (
    <div className="cancel-error-modal-overlay">
      <div className="cancel-error-modal-container">
        <button className="cancel-error-close-button" onClick={onClose}>×</button>
        
        <div className="cancel-error-content">
          <div className="cancel-error-header">
            <img src={errorIcon} alt="에러" className="cancel-error-icon" />
            <span className="cancel-error-title">Error!</span>
          </div>
          
          <div className="cancel-error-message">
            {getErrorMessage()}
          </div>
          <button className="cancel-error-close-modal-button" onClick={onClose}>
            닫기
          </button>
        </div>
      </div>
    </div>
  );
};

export default CancelError;
