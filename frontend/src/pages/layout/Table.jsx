import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Cancel from '../Cancel';
import '../../styles/layout/table.css';

const TableLayout = ({ selectedDate, displayDate, reservedTables = [], timeSlot }) => {
  const navigate = useNavigate();
  const [showCancelModal, setShowCancelModal] = useState(false);
  const [selectedTableData, setSelectedTableData] = useState(null);

  const isTableReserved = (tableNumber) => {
    console.log(`Checking table ${tableNumber}, Reserved tables:`, reservedTables); // 디버깅용
    return reservedTables.includes(tableNumber);
  };

  const handleTableClick = (tableNumber) => {
    if (isTableReserved(tableNumber)) {
      setSelectedTableData({
        tableNumber,
        date: selectedDate,
        timeSlot
      });
      setShowCancelModal(true);
    } else {
      navigate('/reservation', {
        state: {
          selectedDate,
          timeSlot,
          tableNumber
        }
      });
    }
  };

  const handleCloseCancelModal = () => {
    setShowCancelModal(false);
    setSelectedTableData(null);
  };

  // 디버깅을 위한 로그 추가
  console.log('Current timeSlot:', timeSlot);
  console.log('Reserved Tables:', reservedTables);

  return (
    <>
      <div className="restaurant-layout">
        {/* 왼쪽 영역 테두리 */}
        <div className="left-border"></div>
        
        {/* 오른쪽 영역 테두리 */}
        <div className="right-border"></div>
        
        {/* 오른쪽 영역 테두리 */}
        <div className="line-1"></div>

        {/* Toilet 영역 */}
        <div className="toilet-border">
          <div className="toilet-label">[Toilet]</div>
        </div>

        {/* Kitchen 영역 테두리 */}
        <div className="kitchen-border">
          <div className="kitchen-label">[Kitchen]</div>
        </div>

        {/* Entrance 레이블 */}
        <div className="entrance-border">
          <div className="entrance-label">[Entrance]</div>
        </div>

        <div className="tables-area">
          {/* 왼쪽 세로 테이블 */}
          <div className="left-tables">
            <div 
              className={`table six-person ${isTableReserved(1) ? 'reserved' : ''}`} 
              data-table-number="1"
              onClick={() => handleTableClick(1)}
            >
              <div className="table-number">[1번]</div>
              <div className="table-seats">6인석</div>
            </div>
            <div 
              className={`table six-person ${isTableReserved(5) ? 'reserved' : ''}`} 
              data-table-number="5"
              onClick={() => handleTableClick(5)}
            >
              <div className="table-number">[5번]</div>
              <div className="table-seats">6인석</div>
            </div>
          </div>
          
          {/* 중앙 다이아몬드 테이블 */}
          <div className="center-tables">
            <div className="diamond-row">
              {[6, 7, 8, 9, 10].map((tableNum) => (
                <div 
                  key={tableNum}
                  className={`table diamond four-person ${isTableReserved(tableNum) ? 'reserved' : ''}`}
                  data-table-number={tableNum}
                  onClick={() => handleTableClick(tableNum)}
                >
                  <div className="table-number-for-diamond">[{tableNum}번]</div>
                  <div className="table-seats">4인석</div>
                </div>
              ))}
            </div>
          </div>
          
          {/* 하단 테이블 */}
          <div className="bottom-tables">
            {[11, 12, 13, 14].map((tableNum) => (
              <div 
                key={tableNum}
                className={`table two-person ${isTableReserved(tableNum) ? 'reserved' : ''}`}
                data-table-number={tableNum}
                onClick={() => handleTableClick(tableNum)}
              >
                <div className="table-number">[{tableNum}번]</div>
                <div className="table-seats">2인석</div>
              </div>
            ))}
          </div>
          <div className="bottom-tables-2">
            <div 
              className={`table two-person ${isTableReserved(15) ? 'reserved' : ''}`}
              data-table-number="15"
              onClick={() => handleTableClick(15)}
            >
              <div className="table-number">[15번]</div>
              <div className="table-seats">2인석</div>
            </div>
          </div>
          
          {/* 오른쪽 테이블 */}
          <div className="right-tables">
            {[3, 4].map((tableNum) => (
              <div 
                key={tableNum}
                className={`table eight-person ${isTableReserved(tableNum) ? 'reserved' : ''}`}
                data-table-number={tableNum}
                onClick={() => handleTableClick(tableNum)}
              >
                <div className="table-number">[{tableNum}번]</div>
                <div className="table-seats">8인석</div>
              </div>
            ))}
          </div>
        </div>
        <div className="legend">
          <div className="legend-item">
            <div className="legend-color reserved"></div>
            <span>: Reserved</span>
          </div>
          <div className="legend-item">
            <div className="legend-color not-reserved"></div>
            <span>: Not Reserved</span>
          </div>
        </div>
      </div>
      
      {showCancelModal && (
        <Cancel
          reservationData={selectedTableData}
          onClose={handleCloseCancelModal}
        />
      )}
    </>
  );
};

export default TableLayout; 