import React, { useState } from "react";
import Header from "../components/Header";
import Footer from "../components/Footer";
import calendarIcon from "../assets/calendar_icon.png";
import "../styles/MainPage.css";

const MainPage = () => {
  const [selectedDate, setSelectedDate] = useState("");

  const handleDateChange = (e) => {
    const date = e.target.value;
    // YYYY-MM-DD 형식을 DD/MM/YYYY 형식으로 변환
    const [year, month, day] = date.split('-');
    setSelectedDate(`${day}/${month}/${year}`);
  };

  return (
    <div className="main-page">
      <Header />
      <div className="main-container">
        <h1>Reservation</h1>
        <div className="reservation-box">
          <div className="date-input-container">
            <input
              type="text"
              placeholder="날짜를 선택해주세요"
              className="date-input"
              value={selectedDate}
              readOnly
            />
            <label className="calendar-label">
              <input
                type="date"
                onChange={handleDateChange}
                className="calendar-input"
              />
              <img 
                src={calendarIcon} 
                alt="달력" 
                className="calendar-icon"
              />
            </label>
          </div>
          <button 
            className={`reserve-button ${selectedDate ? 'active' : ''}`}
            disabled={!selectedDate}
          >
            View Table
          </button>
        </div>
      </div>
      <Footer />
    </div>
  );
};

export default MainPage; 