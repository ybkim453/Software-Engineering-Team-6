import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Header from "../components/Header";
import Footer from "../components/Footer";
import ImageCarousel from "../components/ImageCarousel"; // ImageCarousel import
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
  today.setHours(0, 0, 0, 0); // 시간을 0으로 설정하여 날짜 비교 정확도 높임

  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState(null);
  // 날짜별 예약 가능 여부 상태 (예: { '2025-06-15': { lunch: true, dinner: false }, ... })
  const [reservationAvailability, setReservationAvailability] = useState({});

  useEffect(() => {
    setCurrentMonth(new Date(today.getFullYear(), today.getMonth(), 1));
  }, []);

  // 예약 가능 여부를 가져오는 함수
  const fetchReservationAvailability = async (year, month) => {
    try {
      // 백엔드 API에서 해당 월의 예약 가능 여부를 가져오는 엔드포인트 (가정)
      // 이 엔드포인트는 해당 월의 각 날짜별 점심/저녁 예약 상태를 반환해야 합니다.
      // 예: { '2025-06-01': { lunch: true, dinner: true }, '2025-06-02': { lunch: false, dinner: true }, ... }
      const response = await fetch(`http://localhost:8080/api/reservations/availability?year=${year}&month=${month + 1}`);
      if (response.ok) {
        const data = await response.json();
        setReservationAvailability(data.availability || {});
      } else {
        console.error('Failed to fetch reservation availability');
        setReservationAvailability({});
      }
    } catch (error) {
      console.error('Error fetching reservation availability:', error);
      setReservationAvailability({});
    }
  };

  useEffect(() => {
    // 현재 달이 변경될 때마다 예약 가능 여부 정보를 다시 가져옴
    fetchReservationAvailability(currentMonth.getFullYear(), currentMonth.getMonth());
  }, [currentMonth]); // currentMonth가 변경될 때마다 실행

  const handleDayClick = (date) => {
    if (isBeforeToday(date)) {
      return; // 오늘 이전 날짜는 클릭 불가
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
      if (isBeforeToday(selectedDate)) {
        alert('오늘 이전의 날짜는 예약할 수 없습니다.');
        return;
      }
      
      // `displayDate` 포맷팅 로직 추가
      const formatDisplayDateForUI = (date) => {
        const month = date.getMonth() + 1;
        const day = date.getDate();
        return `${date.getFullYear()}년 ${month}월 ${day}일`; // "YYYY년 M월 D일" 형식
      };

      navigate('/table-view', {
        state: {
          selectedDate: formatDateToYYYYMMDD(selectedDate),
          originalDate: formatDateToYYYYMMDD(selectedDate), // 호환성을 위해 유지
          displayDate: formatDisplayDateForUI(selectedDate) // `TableView`로 전달할 표시용 날짜
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
    // 다음 2개 달까지만 조회 가능 (현재 달 + 2달)
    const maxMonth = new Date(today.getFullYear(), today.getMonth() + 2, 1); 

    if (nextMonthDate.getFullYear() > maxMonth.getFullYear() || 
        (nextMonthDate.getFullYear() === maxMonth.getFullYear() && 
         nextMonthDate.getMonth() > maxMonth.getMonth())) {
      return;
    }
    setCurrentMonth(nextMonthDate);
  };

  const goToToday = () => {
    setCurrentMonth(new Date(today.getFullYear(), today.getMonth(), 1));
    setSelectedDate(today); // "오늘" 버튼 클릭 시 오늘 날짜 선택되도록 변경
  };
  
  // 이전 달/다음 달 이동 버튼 활성화/비활성화 로직
  const firstDayOfCurrentMonth = new Date(today.getFullYear(), today.getMonth(), 1);
  const isPrevMonthDisabled = areMonthsEqual(currentMonth, firstDayOfCurrentMonth);

  const maxAllowedMonth = new Date(today.getFullYear(), today.getMonth() + 2, 1);
  const isNextMonthDisabled = areMonthsEqual(currentMonth, maxAllowedMonth);


  const renderCalendarDays = () => {
    const year = currentMonth.getFullYear();
    const month = currentMonth.getMonth();

    const firstDayOfMonth = getFirstDayOfMonth(year, month);
    const lastDayOfMonth = getLastDayOfMonth(year, month);
    const numDaysInMonth = lastDayOfMonth.getDate();
    const startingDayOfWeek = getDayOfWeek(firstDayOfMonth); // 0(일) - 6(토)

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
      currentDate.setHours(0,0,0,0); // 시간 초기화

      const isSelected = areDatesEqual(currentDate, selectedDate);
      const isDayToday = isToday(currentDate);
      const isDisabled = isBeforeToday(currentDate); // 오늘 이전 날짜는 비활성화

      const dateString = formatDateToYYYYMMDD(currentDate);
      const dayAvailability = reservationAvailability[dateString];
      // 점심/저녁 모두 예약이 꽉 찼는지 확인
      const isFullyBooked = dayAvailability && !dayAvailability.lunch && !dayAvailability.dinner;

      let dayClasses = "calendar-day";
      if (isDayToday) dayClasses += " today-text"; // 'today' 대신 'today-text'로 변경
      if (isSelected) dayClasses += " selected-day"; // 'selected' 대신 'selected-day'로 변경
      if (isDisabled || isFullyBooked) dayClasses += " disabled"; // 예약 마감도 disabled 처리

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
    const totalCells = 42; // 6주 * 7일
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
        <div className="MainPage-title">안녕하세요, <br></br>Software Restaurant입니다.</div>
        <div className="content-row">
          <div className="left-section">
            <ImageCarousel />
            <div className="restaurant-description">
              <p>고급스러운 다이닝 경험을 제공하는 레스토랑입니다.</p>
              <p>우측 달력에서 날짜를 선택하여 예약을 진행하실 수 있습니다.</p>
            </div>
          </div>
          <div className="calendar-section"> {/* 캘린더 섹션 분리 */}
            {/*<div className="calendar-title">날짜 선택</div> {/* 날짜 선택 텍스트 추가 */}
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
                disabled={!selectedDate || (reservationAvailability[formatDateToYYYYMMDD(selectedDate)] && !reservationAvailability[formatDateToYYYYMMDD(selectedDate)].lunch && !reservationAvailability[formatDateToYYYYMMDD(selectedDate)].dinner)}
              >
                확인
              </button>
            </div>
          </div>
        </div>
      </div>
      <Footer />
    </div>
  );
};

export default MainPage;