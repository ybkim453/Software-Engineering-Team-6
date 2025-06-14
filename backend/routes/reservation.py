from flask import Blueprint, request, jsonify
from database.database import db
from models.reservation import Reservation
from datetime import datetime, date, timedelta

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

@reservation_bp.route('/availability', methods=['GET'])
def get_monthly_availability():
    year_str = request.args.get('year')
    month_str = request.args.get('month') # 1-12
    
    if not year_str or not month_str:
        return jsonify({'message': '년도와 월을 입력해주세요.'}), 400
        
    try:
        year = int(year_str)
        month = int(month_str)
        
        # 해당 월의 첫 날과 마지막 날 계산
        start_date = date(year, month, 1)
        # 다음 달의 0일은 현재 달의 마지막 날
        end_date = date(year, month + 1, 1) - timedelta(days=1) 
        
        # 해당 월의 모든 예약 정보 가져오기
        all_reservations_in_month = Reservation.query.filter(
            Reservation.reservation_date >= start_date,
            Reservation.reservation_date <= end_date
        ).all()
        
        # 결과 딕셔너리 초기화
        availability = {}
        
        # 해당 월의 모든 날짜를 순회하며 기본값 설정
        current_day = start_date
        while current_day <= end_date:
            date_str = current_day.strftime('%Y-%m-%d')
            availability[date_str] = {'lunch': True, 'dinner': True} # 기본적으로 모두 예약 가능
            current_day += timedelta(days=1)
            
        # 예약된 테이블 정보를 바탕으로 예약 불가능 상태 업데이트
        for res in all_reservations_in_month:
            res_date_str = res.reservation_date.strftime('%Y-%m-%d')
            # 해당 날짜의 해당 시간대에 예약이 10개 이상 (가정: 총 테이블 수) 이면 꽉 찼다고 간주
            # 실제로는 각 시간대의 테이블 총 개수와 비교해야 합니다.
            # 예시를 위해 임시로 10개 이상이면 꽉 찼다고 가정합니다.
            
            # TODO: 실제 테이블 개수에 따라 꽉 찼는지 판단하는 로직 개선 필요
            # 예를 들어, 해당 날짜/시간대의 테이블 수를 세서 전체 테이블 수와 비교
            
            # 현재는 단순히 해당 날짜/시간대에 예약이 '존재'하면 일단 'false'로 표시 (조금 과장된 예시)
            # 정확한 구현을 위해서는 각 시간대별 예약된 테이블 번호를 세고,
            # 특정 테이블들이 얼마나 예약되었는지, 즉 특정 시간대의 총 수용 인원 등을 고려해야 합니다.
            
            # 임시 로직: 특정 날짜/시간대에 예약이 5개 이상이면 꽉 찼다고 가정
            booked_count = Reservation.query.filter_by(
                reservation_date=res.reservation_date,
                time_slot=res.time_slot
            ).count()

            # 레스토랑의 각 시간대별 전체 테이블 수(예: 점심 15개 테이블, 저녁 15개 테이블)를 가정하고,
            # 그 숫자에 도달하면 'False'로 설정합니다.
            # 이 예시에서는 단순히 5개 이상이면 False라고 가정합니다.
            MAX_TABLES_PER_SLOT = 15 # 예시: 각 시간대별 최대 테이블 수

            if booked_count >= MAX_TABLES_PER_SLOT:
                if res.time_slot == 'lunch':
                    availability[res_date_str]['lunch'] = False
                elif res.time_slot == 'dinner':
                    availability[res_date_str]['dinner'] = False

        return jsonify({'availability': availability}), 200
        
    except ValueError:
        return jsonify({'message': '올바른 년도 또는 월 형식이 아닙니다.'}), 400
    except Exception as e:
        print(f"Error in get_monthly_availability: {str(e)}")
        return jsonify({'message': '월별 예약 가능 여부 조회 중 오류가 발생했습니다.'}), 500

# 새로운 임시 API 엔드포인트 추가
@reservation_bp.route('/fill-day-reservations', methods=['POST'])
def fill_day_reservations():
    data = request.get_json()
    
    # 필수 파라미터 확인
    target_date_str = data.get('date')
    user_id = data.get('userid')
    
    if not target_date_str or not user_id:
        return jsonify({'message': '날짜 (date)와 사용자 ID (userid)를 입력해주세요.'}), 400

    try:
        target_date = datetime.strptime(target_date_str, '%Y-%m-%d').date()
        
        # 실제 레스토랑의 최대 테이블 수 (1번부터 15번까지 총 15개 테이블)
        MAX_TABLE_NUMBER = 15
        
        reservations_to_add = []
        
        # 점심 예약 채우기
        for table_num in range(1, MAX_TABLE_NUMBER + 1):
            existing_reservation = Reservation.query.filter_by(
                reservation_date=target_date,
                time_slot='lunch',
                table_number=table_num
            ).first()
            
            if not existing_reservation: # 이미 예약이 없는 경우에만 추가
                new_reservation = Reservation(
                    userid=user_id,
                    reservation_date=target_date,
                    time_slot='lunch',
                    table_number=table_num,
                    customer_name=f"{user_id}_TestCustomer_Lunch_{table_num}",
                    phone_number="010-1234-5678",
                    card_bank="TestBank",
                    card_number="1234-5678-9012-3456",
                    guest_count=2 # 임의로 2명으로 설정
                )
                reservations_to_add.append(new_reservation)
            
        # 저녁 예약 채우기
        for table_num in range(1, MAX_TABLE_NUMBER + 1):
            existing_reservation = Reservation.query.filter_by(
                reservation_date=target_date,
                time_slot='dinner',
                table_number=table_num
            ).first()
            
            if not existing_reservation: # 이미 예약이 없는 경우에만 추가
                new_reservation = Reservation(
                    userid=user_id,
                    reservation_date=target_date,
                    time_slot='dinner',
                    table_number=table_num,
                    customer_name=f"{user_id}_TestCustomer_Dinner_{table_num}",
                    phone_number="010-9876-5432",
                    card_bank="TestBank",
                    card_number="6543-2109-8765-4321",
                    guest_count=4 # 임의로 4명으로 설정
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
