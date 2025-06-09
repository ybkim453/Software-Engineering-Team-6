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

  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [reservationData, setReservationData] = useState(null);

  useEffect(() => {
    // 필수 state 값들이 없으면 메인 페이지로 리다이렉트
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

  const banks = ["은행 선택", "신한", "국민", "하나", "토스", "농협"];

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // 필수 필드 검증
    if (!formData.name || !formData.phone || !formData.cardNumber || 
        !formData.cardBank || !formData.guestCount || formData.cardBank === "은행 선택") {
      alert("모든 정보를 입력해주세요.");
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
        <form onSubmit={handleSubmit} className="reservation-form">
          <div className="reservation-details">
            <p>날짜: {selectedDate}</p>
            <p>시간대: {timeSlot === 'lunch' ? '점심' : '저녁'}</p>
            <p>테이블 번호: {tableNumber}</p>
          </div>
          <input
            type="text"
            name="name"
            placeholder="이름"
            value={formData.name}
            onChange={handleChange}
            required
          />
          <input
            type="tel"
            name="phone"
            placeholder="전화번호"
            value={formData.phone}
            onChange={handleChange}
            required
          />
          <div className="card-input-group">
            <input
              type="text"
              name="cardNumber"
              placeholder="신용카드 번호"
              value={formData.cardNumber}
              onChange={handleChange}
              required
            />
            <select
              name="cardBank"
              value={formData.cardBank}
              onChange={handleChange}
              className="bank-select"
              required
            >
              {banks.map((bank) => (
                <option key={bank} value={bank === "은행 선택" ? "" : bank}>
                  {bank}
                </option>
              ))}
            </select>
          </div>
          <input
            type="number"
            name="guestCount"
            placeholder="방문 인원 수"
            value={formData.guestCount}
            onChange={handleChange}
            required
            min="1"
          />
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