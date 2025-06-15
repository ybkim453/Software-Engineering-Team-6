import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Header from '../components/Header';
import Footer from '../components/Footer';
import Cancel from './Cancel';
import '../styles/ReservationListPage.css';
import { parseYYYYMMDDToDate } from '../utils/dateUtils';
import restaurantInteriorImage from '../assets/pic1.jpg';

const ReservationCard = ({ reservation, onCancelClick }) => {
  const reservationDate = parseYYYYMMDDToDate(reservation.reservation_date);
  
  let buttonText;
  let buttonClassModifier;
  let buttonAction;
  let buttonDisabled;

  if (reservation.status === 'confirmed') {
      buttonText = "예약 확정";
      buttonClassModifier = "status-confirmed";
      buttonDisabled = true;
      buttonAction = null;
  } else if (reservation.status === 'cancellable') {
      buttonText = "예약 취소";
      buttonClassModifier = "status-cancel";
      buttonAction = () => onCancelClick(reservation);
      buttonDisabled = false;
  } else if (reservation.status === 'unavailable') {
      buttonText = "취소 불가";
      buttonClassModifier = "status-unavailable";
      buttonDisabled = true;
      buttonAction = null;
  } else {
      buttonText = "상태 알 수 없음";
      buttonClassModifier = "status-default";
      buttonDisabled = true;
      buttonAction = null;
  }

  return (
    <div className="reservation-card">
      <div className="reservation-card__image-wrapper">
        <img src={restaurantInteriorImage} alt="Restaurant Table" className="reservation-card__image" />
      </div>
      <div className="reservation-card__details-content">
        <div className="reservation-card__date-display">{reservation.reservation_date.replace(/-/g, ' ')}</div>
        <div className="reservation-card__info-line">
            {reservation.time_slot === 'lunch' ? '점심' : '저녁'} - {reservation.table_number}번 테이블
        </div>
        <div className="reservation-card__info-line">예약자명: {reservation.customer_name}</div>
        <div className="reservation-card__info-line">예약인원: {reservation.guest_count}명</div>
      </div>
      <button
        className={`reservation-card__action-button reservation-card__action-button--${buttonClassModifier}`}
        onClick={buttonAction}
        disabled={buttonDisabled}
      >
        {buttonText}
      </button>
    </div>
  );
};

const ReservationListPage = () => {
  const today = new Date();
  const currentYear = today.getFullYear();
  const currentMonth = today.getMonth() + 1;

  const firstDayOfMonth = `${currentYear}-${currentMonth.toString().padStart(2, '0')}-01`;
  const lastDayOfMonth = new Date(currentYear, currentMonth, 0).getDate();
  const lastDayOfMonthFormatted = `${currentYear}-${currentMonth.toString().padStart(2, '0')}-${lastDayOfMonth.toString().padStart(2, '0')}`;

  const [reservations, setReservations] = useState([]);
  const [filterConfirmed, setFilterConfirmed] = useState(false);
  const [filterCancellable, setFilterCancellable] = useState(false);
  const [startDate, setStartDate] = useState(firstDayOfMonth);
  const [endDate, setEndDate] = useState(lastDayOfMonthFormatted);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  const [showCancelModal, setShowCancelModal] = useState(false);
  const [selectedReservationForCancel, setSelectedReservationForCancel] = useState(null);

  const getUserId = () => {
    return localStorage.getItem('userid');
  };

  const currentUserId = getUserId();

  const fetchReservations = async () => {
    setLoading(true);
    setError(null);
    try {
        if (!currentUserId) {
            setError("로그인이 필요합니다.");
            setLoading(false);
            navigate('/login');
            return;
        }

        let url = `http://localhost:8080/api/reservations/user/${currentUserId}`;
        const params = new URLSearchParams();

        if (filterConfirmed) {
            params.append('confirmed', 'true');
        } else if (filterCancellable) {
            params.append('cancellable', 'true');
        }

        if (startDate) {
            params.append('startDate', startDate);
        }
        if (endDate) {
            params.append('endDate', endDate);
        }

        if (params.toString()) {
            url += `?${params.toString()}`;
        }

        console.log("Fetching URL:", url);
        const response = await fetch(url);
        if (!response.ok) {
            if (response.status === 401) {
                navigate('/login');
                return;
            }
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        const data = await response.json();
        setReservations(data.reservations || []);
    } catch (e) {
        setError("예약 목록을 불러오는 데 실패했습니다: " + e.message);
        console.error("Fetch Reservations Error:", e);
    } finally {
        setLoading(false);
    }
  };

  useEffect(() => {
    fetchReservations();
  }, [filterConfirmed, filterCancellable, startDate, endDate, currentUserId]);

  const handleCancelButtonClick = (reservation) => {
    setSelectedReservationForCancel({
      date: reservation.reservation_date,
      timeSlot: reservation.time_slot,
      tableNumber: reservation.table_number,
    });
    setShowCancelModal(true);
  };

  const handleCloseCancelModal = () => {
    setShowCancelModal(false);
    setSelectedReservationForCancel(null);
    fetchReservations();
  };
  
  const handleFilterChange = (filterName, isChecked) => {
    if (filterName === "확정") {
      setFilterConfirmed(isChecked);
      if (isChecked) setFilterCancellable(false);
    } else if (filterName === "취소가능") {
      setFilterCancellable(isChecked);
      if (isChecked) setFilterConfirmed(false);
    }
  };

  const handleDateFilterChange = (type, value) => {
    if (type === 'start') {
      setStartDate(value);
    } else {
      setEndDate(value);
    }
  };

  return (
    <div className="reservation-list-page">
      <Header />
      <div className="reservation-list-page__main-content-wrapper">
        <div className="reservation-list-page__title">예약 목록</div>

        <div className="reservation-filters-sidebar">
          <div className="reservation-filters-sidebar__group">
            <h3 className="reservation-filters-sidebar__title">예약 종류</h3>
            <label className="reservation-filters-sidebar__checkbox">
              <input
                type="checkbox"
                checked={filterConfirmed}
                onChange={(e) => handleFilterChange("확정", e.target.checked)}
              />
              <span className="reservation-filters-sidebar__checkmark"></span>
              예약 확정
            </label>
            <label className="reservation-filters-sidebar__checkbox">
              <input
                type="checkbox"
                checked={filterCancellable}
                onChange={(e) => handleFilterChange("취소가능", e.target.checked)}
              />
              <span className="reservation-filters-sidebar__checkmark"></span>
              취소 가능
            </label>
          </div>

          <div className="reservation-filters-sidebar__divider"></div>

          <div className="reservation-filters-sidebar__group">
            <h3 className="reservation-filters-sidebar__title">예약 일자</h3>
            <div className="reservation-filters-sidebar__date-range-inputs">
                <input
                    type="month"
                    value={startDate ? `${new Date(startDate).getFullYear()}-${(new Date(startDate).getMonth() + 1).toString().padStart(2, '0')}` : ''}
                    onChange={(e) => handleDateFilterChange('start', e.target.value + '-01')}
                    className="reservation-filters-sidebar__date-input"
                />
                <span className="reservation-filters-sidebar__date-separator"></span>
                <input
                    type="month"
                    value={endDate ? `${new Date(endDate).getFullYear()}-${(new Date(endDate).getMonth() + 1).toString().padStart(2, '0')}` : ''}
                    onChange={(e) => {
                        const selectedMonth = e.target.value;
                        const year = parseInt(selectedMonth.substring(0, 4), 10);
                        const month = parseInt(selectedMonth.substring(5, 7), 10);
                        const lastDay = new Date(year, month, 0).getDate();
                        handleDateFilterChange('end', `${selectedMonth}-${lastDay}`);
                    }}
                    className="reservation-filters-sidebar__date-input"
                />
            </div>
          </div>
        </div>

        <div className="reservation-cards-section">
          {loading && <p className="message--loading">예약 목록을 불러오는 중...</p>}
          {error && <p className="message--error">{error}</p>}
          {!loading && !error && reservations.length === 0 && (
            <p className="message--no-reservations">현재 예약이 없습니다.</p>
          )}

          {!loading && !error && reservations.length > 0 && (
            <div className="reservation-cards-section__grid">
              {reservations.map((reservation) => (
                <ReservationCard 
                  key={reservation.id} 
                  reservation={reservation} 
                  onCancelClick={handleCancelButtonClick} 
                />
              ))}
            </div>
          )}
        </div>
      </div>
      <Footer />

      {showCancelModal && selectedReservationForCancel && (
        <Cancel
          reservationData={selectedReservationForCancel}
          onClose={handleCloseCancelModal}
        />
      )}
    </div>
  );
};

export default ReservationListPage;