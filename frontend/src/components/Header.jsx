import React from "react";
import "../styles/Header.css";
import personIcon from "../assets/person_icon.png";

const Header = () => {
  return (
    <header className="app-header">
      <div className="title">Software Restaurant</div>
      <div className="icon">
        <img src={personIcon} alt="사용자 아이콘" />
      </div>
    </header>
  );
};

export default Header;
