import React, { useState, useEffect, useRef } from 'react';
import '../styles/ImageCarousel.css';
import image_1 from '../assets/pic1.jpg';
import image_2 from '../assets/pic2.jpg';
import image_3 from '../assets/pic3.jpg';

const images = [
    image_1,
    image_2,
    image_3,
];

const ImageCarousel = () => {
    const [currentIndex, setCurrentIndex] = useState(0);
    const touchStartX = useRef(0);
    const touchEndX = useRef(0);

    // 자동 슬라이드
    useEffect(() => {
        const interval = setInterval(() => {
        setCurrentIndex((prevIndex) => (prevIndex + 1) % images.length);
        }, 5000); // 5초마다 자동 변경

        return () => clearInterval(interval);
    }, []);

    const goToNext = () => {
        setCurrentIndex((prevIndex) => (prevIndex + 1) % images.length);
    };

    const goToPrev = () => {
        setCurrentIndex((prevIndex) => (prevIndex - 1 + images.length) % images.length);
    };

    const handleTouchStart = (e) => {
        touchStartX.current = e.touches[0].clientX;
    };

    const handleTouchMove = (e) => {
        touchEndX.current = e.touches[0].clientX;
    };

    const handleTouchEnd = () => {
        if (touchStartX.current - touchEndX.current > 50) { // 스와이프 왼쪽
        goToNext();
        } else if (touchStartX.current - touchEndX.current < -50) { // 스와이프 오른쪽
        goToPrev();
        }
        touchStartX.current = 0;
        touchEndX.current = 0;
    };


    return (
        <div className="carousel-container">
        <div 
            className="carousel-track" 
            style={{ transform: `translateX(-${currentIndex * 100}%)` }}
            onTouchStart={handleTouchStart}
            onTouchMove={handleTouchMove}
            onTouchEnd={handleTouchEnd}
        >
            {images.map((src, index) => (
            <img key={index} src={src} alt={`Restaurant ${index + 1}`} className="carousel-image" />
            ))}
        </div>
        <button className="carousel-control prev" onClick={goToPrev}>&#10094;</button>
        <button className="carousel-control next" onClick={goToNext}>&#10095;</button>
        <div className="carousel-dots">
            {images.map((_, index) => (
            <span
                key={index}
                className={`dot ${currentIndex === index ? 'active' : ''}`}
                onClick={() => setCurrentIndex(index)}
            ></span>
            ))}
        </div>
        </div>
    );
};

export default ImageCarousel;