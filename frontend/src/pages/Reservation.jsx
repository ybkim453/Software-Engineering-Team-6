import React, { useState, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import Header from "../components/Header";
import Footer from "../components/Footer";
import ReservationSuccess from "./layout/Reservation_Success";
import "../styles/Reservation.css";

const Reservation = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { selectedDate, timeSlot, tableNumber } = location.state || {};
  const getMaxGuestsByTable = (tableNum) => {
    const tableNumber = parseInt(tableNum);
    if ([1, 4].includes(tableNumber)) return 6;
    if ([2, 3].includes(tableNumber)) return 8;
    if ([5, 6, 7, 8, 9].includes(tableNumber)) return 4;
    if ([10, 11, 12, 13, 14].includes(tableNumber)) return 2;
    return 1;
  };

  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [reservationData, setReservationData] = useState(null);

  useEffect(() => {
    if (!selectedDate || !timeSlot || !tableNumber) {
      alert('잘못된 접근입니다.');
      navigate('/main');
    }
  }, [selectedDate, timeSlot, tableNumber, navigate]);

  const [formData, setFormData] = useState({
    name: "",
    phone: "",
    cardBank: "",
    cardNumber: "",
    guestCount: ""
  });

  const [errors, setErrors] = useState({
    name: "",
    phone: "",
    cardBank: "",
    cardNumber: "",
    guestCount: ""
  });

  const errorMessages = {
    name: "이름을 정확히 입력해 주세요.",
    phone: "전화번호를 정확히 입력해 주세요.",
    cardBank: "은행을 선택해 주세요.",
    cardNumber: "카드 번호를 정확히 입력해 주세요.",
    guestCount: "방문 인원 수를 정확히 입력해 주세요.",
  };

  const banks = ["은행 선택", "신한", "국민", "하나", "토스", "농협"];

  const validateField = (name, value) => {
    switch (name) {
      case 'guestCount':
        const count = parseInt(value);
        const maxGuests = getMaxGuestsByTable(tableNumber);
        return count >= 1 && count <= maxGuests;
      case 'cardBank':
        return value !== "" && value !== "은행 선택";
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

    // 입력이 있으면 에러 상태 제거
    if (value.trim()) {
      setErrors(prev => ({
        ...prev,
        [name]: false
      }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // 필수 필드 검증
    const newErrors = {};
    if (!formData.name) newErrors.name = errorMessages.name;
    if (!formData.phone) newErrors.phone = errorMessages.phone;
    if (!formData.cardNumber) newErrors.cardNumber = errorMessages.cardNumber;
    if (!formData.cardBank || formData.cardBank === "은행 선택") newErrors.cardBank = errorMessages.cardBank;
    if (!formData.guestCount) newErrors.guestCount = errorMessages.guestCount;

    setErrors(newErrors);

    if (Object.keys(newErrors).length > 0) {
      return;
    }

    const userid = localStorage.getItem('userid');
    if (!userid) {
      alert('로그인이 필요합니다.');
      navigate('/login');
      return;
    }

    // state 값들이 있는지 한번 더 확인
    if (!selectedDate || !timeSlot || !tableNumber) {
      alert('예약 정보가 올바르지 않습니다.');
      navigate('/main');
      return;
    }

    try {
      const requestData = {
        userid: userid,
        reservationDate: selectedDate,
        timeSlot: timeSlot,
        tableNumber: parseInt(tableNumber),
        customerName: formData.name,
        phoneNumber: formData.phone,
        cardBank: formData.cardBank,
        cardNumber: formData.cardNumber,
        guestCount: parseInt(formData.guestCount)
      };

      console.log('Sending reservation request:', requestData);

      const response = await fetch('http://localhost:8080/api/reservations/', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestData)
      });

      const data = await response.json();
      console.log('Server response:', data);

      if (response.ok) {
        setReservationData(requestData);
        setShowSuccessModal(true);
      } else {
        alert(data.message || '예약 중 오류가 발생했습니다.');
      }
    } catch (error) {
      console.error('Reservation error:', error);
      alert('예약 중 오류가 발생했습니다.');
    }
  };

  // state 값들이 없으면 로딩 중이거나 리다이렉트 중
  if (!selectedDate || !timeSlot || !tableNumber) {
    return null;
  }

  return (
    <div className="reservation-page">
      <Header />
      <div className="reservation-container">
        <h2>예약하기</h2>
        <form onSubmit={handleSubmit} className="reservation-form" noValidate>
          <div className="reservation-details">
            <p>날짜: {selectedDate}</p>
            <p>시간대: {timeSlot === 'lunch' ? '점심' : '저녁'}</p>
            <p>테이블 번호: {tableNumber}</p>
            <p>테이블 위치: {
                tableNumber === 1 || tableNumber === 4
                ? "창가"
                : tableNumber === 2 || tableNumber === 3
                ? "룸, 창가"
                : "복도"
              }</p>
            <p>최대 인원: {getMaxGuestsByTable(tableNumber)}명</p>
          </div>
          <div className={`reservation-input-group ${errors.name ? 'error' : ''}`}>
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
          <div className={`reservation-input-group ${errors.phone ? 'error' : ''}`}>
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
          <div className="reservation-card-group">
            <div className={`card-number-container ${errors.cardNumber ? 'error' : ''}`}>
              <input
                type="text"
                name="cardNumber"
                placeholder="신용카드 번호"
                value={formData.cardNumber}
                onChange={handleChange}
              />
              {errors.cardNumber && (
                <div className="error-message card-error">
                  <i className="error-icon">!</i>
                  {errorMessages.cardNumber}
                </div>
              )}
            </div>
            <div className={`bank-select-container ${errors.cardBank ? 'error' : ''}`}>
              <select
                name="cardBank"
                value={formData.cardBank}
                onChange={handleChange}
                className="bank-select"
              >
                {banks.map((bank) => (
                  <option key={bank} value={bank === "은행 선택" ? "" : bank}>
                    {bank}
                  </option>
                ))}
              </select>
              {errors.cardBank && (
                <div className="error-message bank-error">
                  <i className="error-icon">!</i>
                  {errorMessages.cardBank}
                </div>
              )}
            </div>
          </div>
          <div className={`reservation-input-group ${errors.guestCount ? 'error' : ''}`}>
            <input
              type="number"
              name="guestCount"
              placeholder="방문 인원 수"
              value={formData.guestCount}
              onChange={handleChange}
              min="1"
              max={getMaxGuestsByTable(tableNumber)}
            />
            {errors.guestCount && (
              <div className="error-message">
                <i className="error-icon">!</i>
                {errorMessages.guestCount}
              </div>
            )}
          </div>
          <div className="button-container">
            <button type="submit" className="reservation-button">
              예약 완료
            </button>
          </div>
        </form>
      </div>
      <Footer />
      {showSuccessModal && (
        <ReservationSuccess
          reservationData={reservationData}
          onClose={() => setShowSuccessModal(false)}
        />
      )}
    </div>
  );
};

export default Reservation; 