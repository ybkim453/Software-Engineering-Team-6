from flask import Blueprint, request, jsonify
from database.database import db
from models.reservation import Reservation
from datetime import datetime

reservation_bp = Blueprint('reservation', __name__)

@reservation_bp.route('/tables', methods=['GET'])
def get_table_status():
    date = request.args.get('date')
    time_slot = request.args.get('timeSlot')
    
    if not date or not time_slot:
        return jsonify({'message': '날짜와 시간대를 선택해주세요.'}), 400
    
    try:
        # 문자열을 날짜 객체로 변환
        date = datetime.strptime(date, '%Y-%m-%d').date()
        
        # 해당 날짜와 시간대의 예약된 테이블 조회
        reservations = Reservation.query.filter_by(
            reservation_date=date,
            time_slot=time_slot
        ).all()
        
        # 예약된 테이블 번호 목록 생성
        reserved_tables = [r.table_number for r in reservations]
        
        return jsonify({
            'reservedTables': reserved_tables,
            'date': date.strftime('%Y-%m-%d'),
            'timeSlot': time_slot
        })
        
    except ValueError:
        return jsonify({'message': '올바른 날짜 형식이 아닙니다.'}), 400
    except Exception as e:
        return jsonify({'message': '테이블 상태 조회 중 오류가 발생했습니다.'}), 500

@reservation_bp.route('/', methods=['POST'])
def make_reservation():
    data = request.get_json()
    
    required_fields = ['userid', 'reservationDate', 'timeSlot', 'tableNumber',
                      'customerName', 'phoneNumber', 'cardBank', 'cardNumber', 'guestCount']
    
    if not all(field in data for field in required_fields):
        return jsonify({'message': '모든 정보를 입력해주세요.'}), 400
    
    try:
        # 날짜 형식 변환
        reservation_date = datetime.strptime(data['reservationDate'], '%Y-%m-%d').date()
        
        # 해당 날짜/시간/테이블에 이미 예약이 있는지 확인
        existing_reservation = Reservation.query.filter_by(
            reservation_date=reservation_date,
            time_slot=data['timeSlot'],
            table_number=data['tableNumber']
        ).first()
        
        if existing_reservation:
            return jsonify({'message': '이미 예약된 테이블입니다.'}), 400
        
        # 새 예약 생성
        new_reservation = Reservation(
            userid=data['userid'],
            reservation_date=reservation_date,
            time_slot=data['timeSlot'],
            table_number=data['tableNumber'],
            customer_name=data['customerName'],
            phone_number=data['phoneNumber'],
            card_bank=data['cardBank'],
            card_number=data['cardNumber'],
            guest_count=data['guestCount']
        )
        
        db.session.add(new_reservation)
        db.session.commit()
        
        return jsonify({'message': '예약이 완료되었습니다.', 'id': new_reservation.id}), 201
        
    except ValueError:
        return jsonify({'message': '올바른 날짜 형식이 아닙니다.'}), 400
    except Exception as e:
        db.session.rollback()
        return jsonify({'message': '예약 중 오류가 발생했습니다.'}), 500

@reservation_bp.route('/user/<userid>', methods=['GET'])
def get_user_reservations(userid):
    try:
        reservations = Reservation.query.filter_by(userid=userid).all()
        
        return jsonify({
            'reservations': [{
                'id': r.id,
                'date': r.reservation_date.strftime('%Y-%m-%d'),
                'timeSlot': r.time_slot,
                'tableNumber': r.table_number,
                'customerName': r.customer_name,
                'guestCount': r.guest_count
            } for r in reservations]
        })
        
    except Exception as e:
        return jsonify({'message': '예약 조회 중 오류가 발생했습니다.'}), 500

@reservation_bp.route('/cancel', methods=['POST'])
def cancel_reservation():
    data = request.get_json()
    
    if not all(key in data for key in ['date', 'timeSlot', 'tableNumber']):
        return jsonify({'message': '필요한 정보가 누락되었습니다.'}), 400
    
    try:
        # 문자열을 날짜 객체로 변환
        reservation_date = datetime.strptime(data['date'], '%Y-%m-%d').date()
        
        # 해당 예약 찾기
        reservation = Reservation.query.filter_by(
            reservation_date=reservation_date,
            time_slot=data['timeSlot'],
            table_number=data['tableNumber']
        ).first()
        
        if not reservation:
            return jsonify({'message': '예약 정보를 찾을 수 없습니다.'}), 404
            
        # 예약 삭제
        db.session.delete(reservation)
        db.session.commit()
        
        return jsonify({'message': '예약이 성공적으로 취소되었습니다.'})
        
    except ValueError:
        return jsonify({'message': '올바른 날짜 형식이 아닙니다.'}), 400
    except Exception as e:
        db.session.rollback()
        return jsonify({'message': '예약 취소 중 오류가 발생했습니다.'}), 500

@reservation_bp.route('/details', methods=['POST'])
def get_reservation_details():
    data = request.get_json()
    
    if not all(key in data for key in ['date', 'timeSlot', 'tableNumber']):
        return jsonify({'message': '필요한 정보가 누락되었습니다.'}), 400
    
    try:
        # 문자열을 날짜 객체로 변환
        reservation_date = datetime.strptime(data['date'], '%Y-%m-%d').date()
        
        # 해당 예약 찾기
        reservation = Reservation.query.filter_by(
            reservation_date=reservation_date,
            time_slot=data['timeSlot'],
            table_number=data['tableNumber']
        ).first()
        
        if not reservation:
            return jsonify({'message': '예약 정보를 찾을 수 없습니다.'}), 404
            
        return jsonify({
            'userid': reservation.userid,
            'customerName': reservation.customer_name,
            'phoneNumber': reservation.phone_number,
            'guestCount': reservation.guest_count,
            'date': data['date'],
            'timeSlot': data['timeSlot'],
            'tableNumber': data['tableNumber']
        })
        
    except ValueError:
        return jsonify({'message': '올바른 날짜 형식이 아닙니다.'}), 400
    except Exception as e:
        print(f"Error in get_reservation_details: {str(e)}")
        return jsonify({'message': '예약 정보 조회 중 오류가 발생했습니다.'}), 500 