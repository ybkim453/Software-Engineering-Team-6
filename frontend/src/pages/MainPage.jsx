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

  // 최대 예약 가능 날짜 (오늘 + 30일) 계산
  const maxReservationDate = new Date();
  maxReservationDate.setDate(today.getDate() + 30);
  maxReservationDate.setHours(0, 0, 0, 0); // 시간 초기화

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
    // 오늘 이전이거나 최대 예약 가능 날짜를 초과하면 클릭 불가
    if (isBeforeToday(date) || date > maxReservationDate) {
      return;
    }

    // 예약이 꽉 찬 날짜는 클릭 불가
    const dateString = formatDateToYYYYMMDD(date);
    const availability = reservationAvailability[dateString];
    if (availability && !availability.lunch && !availability.dinner) {
        return;
    }

    setSelectedDate(date);
  };

  const handleConfirm = () => {
    if (selectedDate) {
      // 선택된 날짜가 오늘 이전이거나 최대 예약 가능 날짜를 초과하는지 다시 확인
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
    
    // 현재 달(today가 속한 달) 이전으로 이동 방지
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
    
    // 최대 예약 가능 날짜가 속한 달의 첫째 날을 기준으로 다음 달 이동을 제한
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
  
  // 이전 달/다음 달 이동 버튼 활성화/비활성화 로직
  const isPrevMonthDisabled = (currentMonth.getFullYear() === today.getFullYear() && currentMonth.getMonth() === today.getMonth());
  
  // 현재 달이 최대 예약 가능 날짜가 속한 달과 같거나 그 이후면 다음 달 버튼 비활성화
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

    // 이전 달의 날짜 채우기 (달력 첫 줄 공백)
    for (let i = 0; i < startingDayOfWeek; i++) {
      const prevMonthDay = new Date(year, month, -(startingDayOfWeek - i - 1)).getDate();
      days.push(
        <div key={`prev-${i}`} className="calendar-day other-month">
          {prevMonthDay}
        </div>
      );
    }

    // 현재 달의 날짜
    for (let day = 1; day <= numDaysInMonth; day++) {
      const currentDate = new Date(year, month, day);
      currentDate.setHours(0,0,0,0);

      const isSelected = areDatesEqual(currentDate, selectedDate);
      const isDayToday = isToday(currentDate);
      // 오늘 이전이거나 최대 예약 가능 날짜를 초과하면 비활성화
      const isDisabled = isBeforeToday(currentDate) || currentDate > maxReservationDate; 

      const dateString = formatDateToYYYYMMDD(currentDate);
      const dayAvailability = reservationAvailability[dateString];
      const isFullyBooked = dayAvailability && !dayAvailability.lunch && !dayAvailability.dinner;

      let dayClasses = "calendar-day";
      if (isDayToday) dayClasses += " today-text";
      if (isSelected) dayClasses += " selected-day";
      // 비활성화 조건에 최대 예약 가능 날짜 초과 여부 추가
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

    // 다음 달의 날짜 채우기 (달력 마지막 줄 공백)
    const totalCells = 42;
    const remainingDays = totalCells - days.length;
    for (let i = 1; i <= remainingDays; i++) {
      const nextMonthDate = new Date(year, month + 1, i);
      // 다음 달 날짜도 최대 예약 가능 날짜를 초과하는지 확인하여 비활성화 여부를 고려할 수 있지만,
      // `goToNextMonth` 함수에서 이미 달 이동 자체를 제한하므로 여기서는 단순 렌더링만 합니다.
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
        <ImageCarousel />
        <div className="calendar-section">
          <div className="calendar-title">날짜 선택</div>
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
              // 선택된 날짜가 없거나, 예약이 꽉 찼거나, 최대 예약 가능 날짜를 초과하면 버튼 비활성화
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