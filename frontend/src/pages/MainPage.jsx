import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Header from "../components/Header";
import Footer from "../components/Footer";
import {
  getFirstDayOfMonth,
  getLastDayOfMonth,
  getDayOfWeek,
  formatDateToYYYYMMDD,
  isToday,
  areDatesEqual,
  isBeforeToday,
  areMonthsEqual
} from "../utils/dateUtils";
import "../styles/MainPage.css";

const MainPage = () => {
  const navigate = useNavigate();
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState(null);

  useEffect(() => {
    setCurrentMonth(new Date(today.getFullYear(), today.getMonth(), 1));
  }, []);

  const handleDayClick = (date) => {
    if (isBeforeToday(date)) {
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
      navigate('/table-view', {
        state: {
          selectedDate: formatDateToYYYYMMDD(selectedDate),
          originalDate: formatDateToYYYYMMDD(selectedDate)
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
    if (prevMonthDate.getTime() < firstDayOfCurrentMonth.getTime()) {
      return;
    }
    setCurrentMonth(prevMonthDate);
  };

  const goToNextMonth = () => {
    const nextMonthDate = new Date(currentMonth);
    nextMonthDate.setMonth(currentMonth.getMonth() + 1);
    const maxMonth = new Date(today.getFullYear(), today.getMonth() + 2, 1);
    if (nextMonthDate.getTime() > maxMonth.getTime()) {
      return;
    }
    setCurrentMonth(nextMonthDate);
  };

  const goToToday = () => {
    setCurrentMonth(new Date(today.getFullYear(), today.getMonth(), 1));
    setSelectedDate(null);
  };

  const isPrevMonthDisabled = areMonthsEqual(currentMonth, today);
  const maxAllowedMonth = new Date(today.getFullYear(), today.getMonth() + 2, 1);
  const isNextMonthDisabled = areMonthsEqual(currentMonth, maxAllowedMonth);

  const renderCalendarDays = () => {
    const year = currentMonth.getFullYear();
    const month = currentMonth.getMonth();

    const firstDayOfMonth = getFirstDayOfMonth(year, month);
    const lastDayOfMonth = getLastDayOfMonth(year, month);
    const numDaysInMonth = lastDayOfMonth.getDate();
    const startingDayOfWeek = getDayOfWeek(firstDayOfMonth);
    const numDaysLastMonth = new Date(year, month, 0).getDate();
    const numDaysNextMonth = new Date(year, month + 1, 1).getDate(); // 다음 달의 총 일수 (실제로는 1일의 getDate)

    const days = [];

    // 이전 달의 날짜 (이번 달 첫째 날 이전 공백 채우기)
    for (let i = startingDayOfWeek; i > 0; i--) {
      const day = numDaysLastMonth - i + 1;
      const date = new Date(year, month - 1, day);
      days.push(
        <div key={`prev-${day}`} className="calendar-day other-month">
          {day}
        </div>
      );
    }

    // 현재 달의 날짜
    for (let day = 1; day <= numDaysInMonth; day++) {
      const currentDate = new Date(year, month, day);
      currentDate.setHours(0,0,0,0);
      const isSelected = areDatesEqual(currentDate, selectedDate);
      const isDayToday = isToday(currentDate);
      const isDisabled = isBeforeToday(currentDate);

      let dayClasses = "calendar-day";
      if (isDayToday) dayClasses += " today";
      if (isSelected) dayClasses += " selected";
      if (isDisabled) dayClasses += " disabled";

      days.push(
        <div
          key={`current-${day}`}
          className={dayClasses}
          onClick={isDisabled ? null : () => handleDayClick(currentDate)}
        >
          {day}
        </div>
      );
    }

    // 다음 달의 날짜 (이번 달 마지막 날 이후 공백 채우기)
    const remainingDays = 42 - days.length;
    for (let i = 1; i <= remainingDays; i++) {
      const day = i;
      const date = new Date(year, month + 1, day);
      days.push(
        <div key={`next-${day}`} className="calendar-day other-month">
          {day}
        </div>
      );
    }

    return days;
  };

  return (
    <div className="main-page">
      <Header />
      <div className="main-container">
        <h2>예약 날짜를 선택해주세요</h2>
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
            disabled={!selectedDate}
          >
            확인
          </button>
        </div>
      </div>
      <Footer />
    </div>
  );
};

export default MainPage;