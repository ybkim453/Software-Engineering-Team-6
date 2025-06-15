from flask import Blueprint, request, jsonify
from database.database import db
from models.reservation import Reservation
from datetime import datetime, date, timedelta
from collections import defaultdict

reservation_bp = Blueprint('reservation', __name__)

@reservation_bp.route('/tables', methods=['GET'])
def get_table_status():
    req_date = request.args.get('date')
    time_slot = request.args.get('timeSlot')
    
    if not req_date or not time_slot:
        return jsonify({'message': '날짜와 시간대를 선택해주세요.'}), 400
    
    try:
        query_date = datetime.strptime(req_date, '%Y-%m-%d').date()
        
        reservations = Reservation.query.filter_by(
            reservation_date=query_date,
            time_slot=time_slot
        ).all()
        
        reserved_tables = [r.table_number for r in reservations]
        
        return jsonify({
            'reservedTables': reserved_tables,
            'date': query_date.strftime('%Y-%m-%d'),
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
        reservation_date = datetime.strptime(data['reservationDate'], '%Y-%m-%d').date()
        
        existing_reservation = Reservation.query.filter_by(
            reservation_date=reservation_date,
            time_slot=data['timeSlot'],
            table_number=data['tableNumber']
        ).first()
        
        if existing_reservation:
            return jsonify({'message': '이미 예약된 테이블입니다.'}), 400
        
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
        filter_confirmed_param = request.args.get('confirmed')
        filter_cancellable_param = request.args.get('cancellable')
        start_date_param = request.args.get('startDate')
        end_date_param = request.args.get('endDate')

        query = Reservation.query.filter_by(userid=userid)
        
        today_date = date.today()
        now_datetime = datetime.now()

        if start_date_param:
            start_date_obj = datetime.strptime(start_date_param, '%Y-%m-%d').date()
            query = query.filter(Reservation.reservation_date >= start_date_obj)
        if end_date_param:
            end_date_obj = datetime.strptime(end_date_param, '%Y-%m-%d').date()
            query = query.filter(Reservation.reservation_date <= end_date_obj)

        reservations = query.all()
        
        reservations_data = []
        for r in reservations:
            reservation_time_str = '12:00:00' if r.time_slot == 'lunch' else '18:00:00'
            reservation_datetime_obj = datetime.strptime(
                f"{r.reservation_date.strftime('%Y-%m-%d')} {reservation_time_str}",
                '%Y-%m-%d %H:%M:%S'
            )

            status = ""
            if reservation_datetime_obj < now_datetime:
                status = "confirmed"
            elif reservation_datetime_obj < now_datetime + timedelta(hours=24):
                status = "unavailable"
            else:
                status = "cancellable"

            if filter_confirmed_param == 'true' and status != 'confirmed':
                continue
            if filter_cancellable_param == 'true' and status != 'cancellable':
                continue

            reservations_data.append({
                'id': r.id,
                'reservation_date': r.reservation_date.strftime('%Y-%m-%d'),
                'time_slot': r.time_slot,
                'table_number': r.table_number,
                'customer_name': r.customer_name,
                'guest_count': r.guest_count,
                'status': status
            })
        
        # reservations_data.sort(key=lambda x: x['reservation_date'], reverse=True) 

        return jsonify({
            'reservations': reservations_data
        })
        
    except Exception as e:
        print(f"Error in get_user_reservations: {str(e)}")
        return jsonify({'message': '예약 조회 중 오류가 발생했습니다.', 'error': str(e)}), 500

@reservation_bp.route('/cancel', methods=['POST'])
def cancel_reservation():
    data = request.get_json()
    
    if not all(key in data for key in ['date', 'timeSlot', 'tableNumber']):
        return jsonify({'message': '필요한 정보가 누락되었습니다.'}), 400
    
    try:
        reservation_date = datetime.strptime(data['date'], '%Y-%m-%d').date()
        
        reservation = Reservation.query.filter_by(
            reservation_date=reservation_date,
            time_slot=data['timeSlot'],
            table_number=data['tableNumber']
        ).first()
        
        if not reservation:
            return jsonify({'message': '예약 정보를 찾을 수 없습니다.'}), 404
            
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
        reservation_date = datetime.strptime(data['date'], '%Y-%m-%d').date()
        
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

@reservation_bp.route('/availability', methods=['GET'])
def get_monthly_availability():
    year_str = request.args.get('year')
    month_str = request.args.get('month')
    
    if not year_str or not month_str:
        return jsonify({'message': '년도와 월을 입력해주세요.'}), 400
        
    try:
        year = int(year_str)
        month = int(month_str)
        
        start_date = date(year, month, 1)
        end_date = (date(year, month % 12 + 1, 1) - timedelta(days=1)) if month < 12 else date(year + 1, 1, 1) - timedelta(days=1)
        
        all_reservations_in_month = Reservation.query.filter(
            Reservation.reservation_date >= start_date,
            Reservation.reservation_date <= end_date
        ).all()
        
        booked_tables_by_day_slot = defaultdict(lambda: defaultdict(set))
        for res in all_reservations_in_month:
            date_str = res.reservation_date.strftime('%Y-%m-%d')
            booked_tables_by_day_slot[date_str][res.time_slot].add(res.table_number)
        
        availability = {}
        MAX_TABLES = 15
        
        current_day = start_date
        while current_day <= end_date:
            date_str = current_day.strftime('%Y-%m-%d')
            
            lunch_available = len(booked_tables_by_day_slot[date_str]['lunch']) < MAX_TABLES
            dinner_available = len(booked_tables_by_day_slot[date_str]['dinner']) < MAX_TABLES

            availability[date_str] = {
                'lunch': lunch_available,
                'dinner': dinner_available
            }
            current_day += timedelta(days=1)

        return jsonify({'availability': availability}), 200
        
    except ValueError:
        return jsonify({'message': '올바른 년도 또는 월 형식이 아닙니다.'}), 400
    except Exception as e:
        print(f"Error in get_monthly_availability: {str(e)}")
        return jsonify({'message': '월별 예약 가능 여부 조회 중 오류가 발생했습니다.'}), 500

@reservation_bp.route('/fill-day-reservations', methods=['POST'])
def fill_day_reservations():
    data = request.get_json()
    
    target_date_str = data.get('date')
    user_id = data.get('userid')
    
    if not target_date_str or not user_id:
        return jsonify({'message': '날짜 (date)와 사용자 ID (userid)를 입력해주세요.'}), 400

    try:
        target_date = datetime.strptime(target_date_str, '%Y-%m-%d').date()
        
        MAX_TABLE_NUMBER = 15
        
        reservations_to_add = []
        
        for table_num in range(1, MAX_TABLE_NUMBER + 1):
            existing_reservation = Reservation.query.filter_by(
                reservation_date=target_date,
                time_slot='lunch',
                table_number=table_num
            ).first()
            
            if not existing_reservation:
                new_reservation = Reservation(
                    userid=user_id,
                    reservation_date=target_date,
                    time_slot='lunch',
                    table_number=table_num,
                    customer_name=f"{user_id}_TestCustomer_Lunch_{table_num}",
                    phone_number="010-1234-5678",
                    card_bank="TestBank",
                    card_number="1234-5678-9012-3456",
                    guest_count=2
                )
                reservations_to_add.append(new_reservation)
            
        for table_num in range(1, MAX_TABLE_NUMBER + 1):
            existing_reservation = Reservation.query.filter_by(
                reservation_date=target_date,
                time_slot='dinner',
                table_number=table_num
            ).first()
            
            if not existing_reservation:
                new_reservation = Reservation(
                    userid=user_id,
                    reservation_date=target_date,
                    time_slot='dinner',
                    table_number=table_num,
                    customer_name=f"{user_id}_TestCustomer_Dinner_{table_num}",
                    phone_number="010-9876-5432",
                    card_bank="TestBank",
                    card_number="6543-2109-8765-4321",
                    guest_count=4
                )
                reservations_to_add.append(new_reservation)

        if reservations_to_add:
            db.session.add_all(reservations_to_add)
            db.session.commit()
            return jsonify({'message': f'{len(reservations_to_add)}개의 예약을 추가했습니다. {target_date_str}의 점심/저녁 테이블이 채워졌습니다.'}), 201
        else:
            return jsonify({'message': f'{target_date_str}의 점심/저녁 테이블이 이미 모두 예약되어 있습니다. 추가된 예약 없음.'}), 200

    except ValueError:
        db.session.rollback()
        return jsonify({'message': '올바른 날짜 형식이 아닙니다. YYYY-MM-DD 형식으로 입력해주세요.'}), 400
    except Exception as e:
        db.session.rollback()
        print(f"Error filling reservations: {e}")
        return jsonify({'message': '예약 채우기 중 오류가 발생했습니다.', 'error': str(e)}), 500