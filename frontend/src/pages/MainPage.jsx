import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Header from "../components/Header";
import Footer from "../components/Footer";
import ImageCarousel from "../components/ImageCarousel";
import {
  getFirstDayOfMonth,
  getLastDayOfMonth,
  getDayOfWeek,
  formatDateToYYYYMMDD,
  isToday,
  areDatesEqual,
  isBeforeToday,
} from "../utils/dateUtils";
import "../styles/MainPage.css";

const MainPage = () => {
  const navigate = useNavigate();
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const maxReservationDate = new Date();
  maxReservationDate.setDate(today.getDate() + 30);
  maxReservationDate.setHours(0, 0, 0, 0);

  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState(null);
  const [reservationAvailability, setReservationAvailability] = useState({});

  useEffect(() => {
    setCurrentMonth(new Date(today.getFullYear(), today.getMonth(), 1));
  }, []);

  const fetchReservationAvailability = async (year, month) => {
    try {
      const response = await fetch(`http://localhost:8080/api/reservations/availability?year=${year}&month=${month + 1}`);
      if (response.ok) {
        const data = await response.json();
        setReservationAvailability(data.availability || {});
      } else {
        console.error('예약 가능 여부를 가져오지 못했습니다.');
        setReservationAvailability({});
      }
    } catch (error) {
      console.error('예약 가능 여부 요청 중 오류 발생:', error);
      setReservationAvailability({});
    }
  };

  useEffect(() => {
    fetchReservationAvailability(currentMonth.getFullYear(), currentMonth.getMonth());
  }, [currentMonth]);

  const handleDayClick = (date) => {
    if (isBeforeToday(date) || date > maxReservationDate) {
      return;
    }

    const dateString = formatDateToYYYYMMDD(date);
    const availability = reservationAvailability[dateString];
    if (availability && !availability.lunch && !availability.dinner) {
        return;
    }

    setSelectedDate(date);
  };

  const handleConfirm = () => {
    if (selectedDate) {
      if (isBeforeToday(selectedDate)) {
        alert('오늘 이전의 날짜는 예약할 수 없습니다.');
        return;
      }
      if (selectedDate > maxReservationDate) {
        alert(`예약은 오늘로부터 30일 이내까지만 가능합니다. (${maxReservationDate.getFullYear()}년 ${maxReservationDate.getMonth() + 1}월 ${maxReservationDate.getDate()}일까지)`);
        return;
      }
      
      const formatDisplayDateForUI = (date) => {
        const month = date.getMonth() + 1;
        const day = date.getDate();
        return `${date.getFullYear()}년 ${month}월 ${day}일`;
      };

      navigate('/table-view', {
        state: {
          selectedDate: formatDateToYYYYMMDD(selectedDate),
          originalDate: formatDateToYYYYMMDD(selectedDate),
          displayDate: formatDisplayDateForUI(selectedDate)
        }
      });
    } else {
      alert('날짜를 선택해주세요.');
    }
  };

  const goToPrevMonth = () => {
    const prevMonthDate = new Date(currentMonth);
    prevMonthDate.setMonth(currentMonth.getMonth() - 1);
    const firstDayOfCurrentMonth = new Date(today.getFullYear(), today.getMonth(), 1);
    
    if (prevMonthDate.getFullYear() < firstDayOfCurrentMonth.getFullYear() || 
        (prevMonthDate.getFullYear() === firstDayOfCurrentMonth.getFullYear() && 
         prevMonthDate.getMonth() < firstDayOfCurrentMonth.getMonth())) {
      return;
    }
    setCurrentMonth(prevMonthDate);
  };

  const goToNextMonth = () => {
    const nextMonthDate = new Date(currentMonth);
    nextMonthDate.setMonth(currentMonth.getMonth() + 1);
    
    const maxAllowedMonthForNavigation = new Date(maxReservationDate.getFullYear(), maxReservationDate.getMonth(), 1);

    if (nextMonthDate > maxAllowedMonthForNavigation) {
      return;
    }
    setCurrentMonth(nextMonthDate);
  };

  const goToToday = () => {
    setCurrentMonth(new Date(today.getFullYear(), today.getMonth(), 1));
    setSelectedDate(today);
  };
  
  const isPrevMonthDisabled = (currentMonth.getFullYear() === today.getFullYear() && currentMonth.getMonth() === today.getMonth());
  
  const isNextMonthDisabled = (currentMonth.getFullYear() > maxReservationDate.getFullYear() ||
    (currentMonth.getFullYear() === maxReservationDate.getFullYear() && currentMonth.getMonth() >= maxReservationDate.getMonth()));


  const renderCalendarDays = () => {
    const year = currentMonth.getFullYear();
    const month = currentMonth.getMonth();

    const firstDayOfMonth = getFirstDayOfMonth(year, month);
    const lastDayOfMonth = getLastDayOfMonth(year, month);
    const numDaysInMonth = lastDayOfMonth.getDate();
    const startingDayOfWeek = getDayOfWeek(firstDayOfMonth);

    const days = [];

    for (let i = 0; i < startingDayOfWeek; i++) {
      const prevMonthDay = new Date(year, month, -(startingDayOfWeek - i - 1)).getDate();
      days.push(
        <div key={`prev-${i}`} className="calendar-day other-month">
          {prevMonthDay}
        </div>
      );
    }

    for (let day = 1; day <= numDaysInMonth; day++) {
      const currentDate = new Date(year, month, day);
      currentDate.setHours(0,0,0,0);

      const isSelected = areDatesEqual(currentDate, selectedDate);
      const isDayToday = isToday(currentDate);
      const isDisabled = isBeforeToday(currentDate) || currentDate > maxReservationDate; 

      const dateString = formatDateToYYYYMMDD(currentDate);
      const dayAvailability = reservationAvailability[dateString];
      const isFullyBooked = dayAvailability && !dayAvailability.lunch && !dayAvailability.dinner;

      let dayClasses = "calendar-day";
      if (isDayToday) dayClasses += " today-text";
      if (isSelected) dayClasses += " selected-day";
      if (isDisabled || isFullyBooked) dayClasses += " disabled";

      days.push(
        <div
          key={`current-${day}`}
          className={dayClasses}
          onClick={(isDisabled || isFullyBooked) ? null : () => handleDayClick(currentDate)}
        >
          {day}
        </div>
      );
    }

    const totalCells = 42;
    const remainingDays = totalCells - days.length;
    for (let i = 1; i <= remainingDays; i++) {
      const nextMonthDate = new Date(year, month + 1, i);
      days.push(
        <div key={`next-${i}`} className="calendar-day other-month">
          {nextMonthDate.getDate()}
        </div>
      );
    }

    return days;
  };

  return (
    <div className="main-page">
      <Header />
      <div className="main-content-wrapper">
        <div className="carousel-text-container">
          <p className="greeting-text">안녕하세요<br />Software Restaurant입니다.</p>
          <ImageCarousel />
          <p className="restaurant-description">고급스러운 다이닝 경험을 제공하는 레스토랑입니다.<br />날짜를 선택해 예약할 수 있습니다.</p>
        </div>
        <div className="calendar-section">
          <div className="calendar-box">
            <div className="calendar-header">
              <span className="today-button" onClick={goToToday}>
                오늘
              </span>
              <div className="month-navigator">
                <button onClick={goToPrevMonth} disabled={isPrevMonthDisabled}>&lt;</button>
                <span>
                  {currentMonth.getFullYear()}년 {currentMonth.getMonth() + 1}월
                </span>
                <div className="month-navigator">
                  <button onClick={goToPrevMonth} disabled={isPrevMonthDisabled}>&lt;</button>
                  <span>
                    {currentMonth.getFullYear()}년 {currentMonth.getMonth() + 1}월
                  </span>
                  <button onClick={goToNextMonth} disabled={isNextMonthDisabled}>&gt;</button>
                </div>
              </div>
              <div className="calendar-grid">
                <div className="calendar-weekdays">
                  <span>일</span>
                  <span>월</span>
                  <span>화</span>
                  <span>수</span>
                  <span>목</span>
                  <span>금</span>
                  <span>토</span>
                </div>
                <div className="calendar-days">{renderCalendarDays()}</div>
              </div>
              <button
                className="confirm-button"
                onClick={handleConfirm}
                disabled={!selectedDate || (reservationAvailability[formatDateToYYYYMMDD(selectedDate)] && !reservationAvailability[formatDateToYYYYMMDD(selectedDate)].lunch && !reservationAvailability[formatDateToYYYYMMDD(selectedDate)].dinner)}
              >
                확인
              </button>
            </div>
            <button
              className="confirm-button"
              onClick={handleConfirm}
              disabled={
                !selectedDate || 
                (reservationAvailability[formatDateToYYYYMMDD(selectedDate)] && !reservationAvailability[formatDateToYYYYMMDD(selectedDate)].lunch && !reservationAvailability[formatDateToYYYYMMDD(selectedDate)].dinner) ||
                selectedDate > maxReservationDate
              }
            >
              확인
            </button>
          </div>
        </div>
      </div>
      <Footer />
    </div>
  );
};

export default MainPage;