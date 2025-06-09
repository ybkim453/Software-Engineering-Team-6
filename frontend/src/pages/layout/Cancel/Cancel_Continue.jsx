import React from 'react';
import checkIcon from '../../../assets/check_icon.png';
import '../../../styles/layout/Cancel/Cancel_Continue.css';

const CancelContinue = ({ onConfirm, onClose }) => {
  return (
    <div className="cancel-continue-modal-overlay">
      <div className="cancel-continue-modal-container">
        <button className="cancel-continue-close-button" onClick={onClose}>×</button>
        
        <div className="cancel-continue-content">
          <div className="cancel-continue-title">
            정말로 예약을 취소하겠습니까?
          </div>
          
          <div className="cancel-continue-buttons">
            <button 
              className="cancel-continue-confirm-button" 
              onClick={onConfirm}
            >
              예
            </button>
            <button 
              className="cancel-continue-close-modal-button" 
              onClick={onClose}
            >
              아니오
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CancelContinue;
