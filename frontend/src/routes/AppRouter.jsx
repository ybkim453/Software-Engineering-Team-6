// src/routes/AppRouter.jsx
import React from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import LoginPage from "../pages/LoginPage";
import SignupPage from "../pages/SignupPage";
import MainPage from "../pages/MainPage";
import TableView from "../pages/TableView";
import Reservation from "../pages/Reservation";
import ReservationListPage from "../pages/ReservationListPage";

const AppRouter = () => {
  return (
    <Routes>
      <Route path="/" element={<Navigate to="/login" />} />
      <Route path="/login" element={<LoginPage />} />
      <Route path="/signup" element={<SignupPage />} />
      
      {/* 날짜 선택 메인 페이지 */}
      <Route path="/main" element={<MainPage />} />

      {/* 테이블 뷰 및 에약 */}
      <Route path="/table-view" element={<TableView />} />
      <Route path="/reservation" element={<Reservation />} />

      {/* 예약 목록 페이지 */}
      <Route path="/my-reservations" element={<ReservationListPage />} />
    </Routes>
  );
};

export default AppRouter;
