import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import Header from "../components/Header";
import Footer from "../components/Footer";
import calendarIcon from "../assets/calendar_icon.png";
import "../styles/MainPage.css";

const MainPage = () => {
  const [selectedDate, setSelectedDate] = useState("");
  const navigate = useNavigate();

  const handleDateChange = (e) => {
    const selectedDate = e.target.value;  // YYYY-MM-DD 형식
    setSelectedDate(selectedDate);
  };

  const handleViewTable = () => {
    if (selectedDate) {
      navigate('/table-view', {
        state: {
          selectedDate: selectedDate,  // YYYY-MM-DD 형식 그대로 사용
          originalDate: selectedDate
        }
      });
    } else {
      alert('날짜를 선택해주세요.');
    }
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
            onClick={handleViewTable}
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