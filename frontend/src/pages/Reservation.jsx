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
    const parsedTableNum = parseInt(tableNum);
    if ([1, 4].includes(parsedTableNum)) return 6;
    if ([2, 3].includes(parsedTableNum)) return 8;
    if ([5, 6, 7, 8, 9].includes(parsedTableNum)) return 4;
    if ([10, 11, 12, 13, 14].includes(parsedTableNum)) return 2;
    return 1; // 기본값 또는 알 수 없는 경우
  };
  const maxGuestsForSelectedTable = getMaxGuestsByTable(tableNumber); // 현재 테이블의 최대 인원
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
  };

  const banks = ["은행 선택", "신한", "국민", "하나", "토스", "농협"];

  const validateField = (name, value) => {
    switch (name) {
      case 'guestCount':
        const count = parseInt(value);
        return count >= 1 && count <= maxGuestsForSelectedTable;
      case 'cardBank':
        return value !== "" && value !== "은행 선택";
      case 'name':
      case 'phone':
      case 'cardNumber':
        return value.trim() !== '';
      default:
        return true;
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));

    // 입력이 있으면 에러 상태 제거
    // guestCount의 경우, 입력값이 변할 때마다 유효성 검사하여 바로 에러 메시지 업데이트
    if (name === 'guestCount') {
        const count = parseInt(value);
        let guestCountError = "";
        if (isNaN(count) || count < 1) {
            guestCountError = "방문 인원 수는 1명 이상이어야 합니다.";
        } else if (count > maxGuestsForSelectedTable) {
            guestCountError = `이 테이블은 최대 ${maxGuestsForSelectedTable}명까지 예약 가능합니다.`;
        }
        setErrors(prev => ({
            ...prev,
            guestCount: guestCountError
        }));
    } else {
        if (value.trim()) {
            setErrors(prev => ({
                ...prev,
                [name]: "" // 에러 메시지를 빈 문자열로 설정하여 에러 없음 표시
            }));
        } else {
             // 비어있는 경우 다시 에러 메시지 설정 (필수 필드)
            setErrors(prev => ({
                ...prev,
                [name]: errorMessages[name] // 일반 필수 필드 에러 메시지 재설정
            }));
        }
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const newErrors = {};
    let hasError = false; // 에러 존재 여부를 추적

    // 이름, 전화번호, 카드번호, 은행 검증
    if (!formData.name.trim()) { newErrors.name = errorMessages.name; hasError = true; }
    if (!formData.phone.trim()) { newErrors.phone = errorMessages.phone; hasError = true; }
    if (!formData.cardNumber.trim()) { newErrors.cardNumber = errorMessages.cardNumber; hasError = true; }
    if (!formData.cardBank || formData.cardBank === "은행 선택") { newErrors.cardBank = errorMessages.cardBank; hasError = true; }
    
    // 방문 인원 수 검증 (handleSubmit에서 최종적으로 확인)
    const guestCountValue = parseInt(formData.guestCount);
    if (isNaN(guestCountValue) || guestCountValue < 1) {
        newErrors.guestCount = "방문 인원 수는 1명 이상이어야 합니다.";
        hasError = true;
    } else if (guestCountValue > maxGuestsForSelectedTable) {
        newErrors.guestCount = `이 테이블은 최대 ${maxGuestsForSelectedTable}명까지 예약 가능합니다.`;
        hasError = true;
    } else {
        newErrors.guestCount = ""; // 유효하면 에러 없음
    }

    setErrors(newErrors);

    if (hasError) { // 하나라도 에러가 있으면 제출 방지
      return;
    }

    const userid = localStorage.getItem('userid');
    if (!userid) {
      alert('로그인이 필요합니다.');
      navigate('/login');
      return;
    }

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
            <p>최대 인원: {maxGuestsForSelectedTable}명</p> {/* 동적으로 최대 인원 표시 */}
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
                {errors.name}
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
                {errors.phone}
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
                  {errors.cardNumber}
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
                  {errors.cardBank}
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
              min="1" // HTML5 기본 유효성 검사, 하지만 커스텀 에러 메시지를 위해 JS 로직도 유지
              max={maxGuestsForSelectedTable} // HTML5 기본 유효성 검사
            />
            {errors.guestCount && ( // guestCount 에러 메시지 표시
              <div className="error-message">
                <i className="error-icon">!</i>
                {errors.guestCount}
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