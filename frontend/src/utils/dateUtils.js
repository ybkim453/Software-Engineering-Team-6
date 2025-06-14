/**
 * 주어진 연월의 첫째 날짜를 반환합
 * @param {number} year
 * @param {number} month (0-11)
 * @returns {Date}
 */
export const getFirstDayOfMonth = (year, month) => {
  return new Date(year, month, 1);
};

/**
 * 주어진 연월의 마지막 날짜를 반환
 * @param {number} year
 * @param {number} month (0-11)
 * @returns {Date}
 */
export const getLastDayOfMonth = (year, month) => {
  return new Date(year, month + 1, 0);
};

/**
 * 주어진 날짜의 요일 인덱스를 반환 (일요일: 0, 월요일: 1, ...)
 * @param {Date} date
 * @returns {number}
 */
export const getDayOfWeek = (date) => {
  return date.getDay();
};

/**
 * Date 객체를 YYYY-MM-DD 형식의 문자열로 변환
 * @param {Date} date
 * @returns {string}
 */
export const formatDateToYYYYMMDD = (date) => {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

/**
 * YYYY-MM-DD 형식의 문자열을 Date 객체로 변환
 * @param {string} dateString
 * @returns {Date}
 */
export const parseYYYYMMDDToDate = (dateString) => {
  const [year, month, day] = dateString.split('-').map(Number);
  return new Date(year, month - 1, day);
};

/**
 * 현재 날짜가 오늘인지 확인
 * @param {Date} date
 * @returns {boolean}
 */
export const isToday = (date) => {
  const today = new Date();
  return (
    date.getFullYear() === today.getFullYear() &&
    date.getMonth() === today.getMonth() &&
    date.getDate() === today.getDate()
  );
};

/**
 * 두 날짜가 같은 날짜인지 확인 (연, 월, 일만 비교)
 * @param {Date} date1
 * @param {Date} date2
 * @returns {boolean}
 */
export const areDatesEqual = (date1, date2) => {
    if (!date1 || !date2) return false;
    return (
        date1.getFullYear() === date2.getFullYear() &&
        date1.getMonth() === date2.getMonth() &&
        date1.getDate() === date2.getDate()
    );
};

/**
 * 주어진 날짜가 오늘 이전인지 확인 (오늘 포함 안 함)
 * @param {Date} date
 * @returns {boolean}
 */
export const isBeforeToday = (date) => {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const compareDate = new Date(date); // 새로운 Date 객체 생성
  compareDate.setHours(0, 0, 0, 0);
  return compareDate.getTime() < today.getTime();
};

/**
 * 두 달이 같은 달인지 확인 (연, 월만 비교)
 * @param {Date} date1
 * @param {Date} date2
 * @returns {boolean}
 */
export const areMonthsEqual = (date1, date2) => {
  if (!date1 || !date2) return false;
  return (
    date1.getFullYear() === date2.getFullYear() &&
    date1.getMonth() === date2.getMonth()
  );
};