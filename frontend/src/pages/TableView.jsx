import React, { useState, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import Header from "../components/Header";
import Footer from "../components/Footer";
import TableLayout from "./layout/Table";
import "../styles/TableView.css";

const TableView = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const selectedDate = location.state?.originalDate; // YYYY-MM-DD 형식의 날짜 사용
  const displayDate = location.state?.selectedDate; // 표시용 날짜 (DD/MM/YYYY)
  const [reservedTables, setReservedTables] = useState([]);
  const [timeSlot, setTimeSlot] = useState('lunch'); // 기본값은 점심

  useEffect(() => {
    if (!selectedDate) {
      navigate('/main');
      return;
    }

    const fetchReservedTables = async () => {
      try {
        console.log('Fetching tables for:', selectedDate, timeSlot); // 디버깅용
        const response = await fetch(`http://localhost:8080/api/reservations/tables?date=${selectedDate}&timeSlot=${timeSlot}`, {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
          }
        });

        if (response.ok) {
          const data = await response.json();
          console.log('Received data:', data); // 디버깅용
          setReservedTables(data.reservedTables || []);
        }
      } catch (error) {
        console.error('Error fetching reserved tables:', error);
        setReservedTables([]);
      }
    };

    fetchReservedTables();
  }, [selectedDate, timeSlot, navigate]); // timeSlot이 변경될 때마다 다시 fetch

  const handleTimeSlotChange = (newTimeSlot) => {
    setTimeSlot(newTimeSlot);
  };

  return (
    <div className="table-view-page">
      <Header />
      <div className="table-view-container">
        <div className="table-header">
          <div className="date-display">Selected Date: {selectedDate}</div>
          <div className="time-slot-selector">
            <button 
              className={`time-slot-btn ${timeSlot === 'lunch' ? 'active' : ''}`}
              onClick={() => handleTimeSlotChange('lunch')}
            >
              점심
            </button>
            <button 
              className={`time-slot-btn ${timeSlot === 'dinner' ? 'active' : ''}`}
              onClick={() => handleTimeSlotChange('dinner')}
            >
              저녁
            </button>
          </div>
        </div>
        <TableLayout 
          selectedDate={selectedDate}
          displayDate={displayDate}
          reservedTables={reservedTables}
          timeSlot={timeSlot}
        />
      </div>
      <Footer />
    </div>
  );
};

export default TableView; 