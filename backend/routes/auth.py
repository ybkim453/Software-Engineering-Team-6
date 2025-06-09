from flask import Blueprint, request, jsonify
from werkzeug.security import generate_password_hash, check_password_hash
from database.database import db, User

auth_bp = Blueprint('auth', __name__)

@auth_bp.route('/check-userid', methods=['POST'])
def check_userid():
    data = request.get_json()
    userid = data.get('userid')
    
    if not userid:
        return jsonify({'message': '아이디를 입력해주세요.', 'available': False}), 400
    
    user = User.query.filter_by(userid=userid).first()
    
    return jsonify({
        'available': user is None,
        'message': '사용 가능한 아이디입니다.' if user is None else '이미 존재하는 아이디입니다.'
    })

@auth_bp.route('/signup', methods=['POST'])
def signup():
    data = request.get_json()
    
    # 필수 필드 확인
    required_fields = ['userid', 'password', 'email', 'name', 'phone']
    if not all(field in data for field in required_fields):
        return jsonify({'message': '모든 정보를 입력해주세요.'}), 400
    
    # 아이디 중복 확인
    if User.query.filter_by(userid=data['userid']).first():
        return jsonify({'message': '이미 존재하는 아이디입니다.'}), 400
    
    # 이메일 중복 확인
    if User.query.filter_by(email=data['email']).first():
        return jsonify({'message': '이미 등록된 이메일입니다.'}), 400
    
    try:
        # 비밀번호 해시화
        hashed_password = generate_password_hash(data['password'])
        
        # 새 사용자 생성
        new_user = User(
            userid=data['userid'],
            password=hashed_password,
            email=data['email'],
            name=data['name'],
            phone=data['phone']
        )
        
        # DB에 저장
        db.session.add(new_user)
        db.session.commit()
        
        return jsonify({'message': '회원가입이 완료되었습니다.'}), 201
        
    except Exception as e:
        db.session.rollback()
        return jsonify({'message': '회원가입 중 오류가 발생했습니다.'}), 500

@auth_bp.route('/login', methods=['POST'])
def login():
    data = request.get_json()
    
    if not data or not data.get('userid') or not data.get('password'):
        return jsonify({'message': '아이디와 비밀번호를 입력해주세요.'}), 400
    
    user = User.query.filter_by(userid=data['userid']).first()
    
    if user and check_password_hash(user.password, data['password']):
        return jsonify({
            'message': '로그인 성공',
            'user': {
                'id': user.id,
                'userid': user.userid,
                'name': user.name,
                'email': user.email
            }
        })
    
    return jsonify({'message': '아이디 또는 비밀번호가 올바르지 않습니다.'}), 401

@auth_bp.route('/user/<userid>', methods=['GET'])
def get_user_info(userid):
    try:
        user = User.query.filter_by(userid=userid).first()
        
        if not user:
            return jsonify({'message': '사용자를 찾을 수 없습니다.'}), 404
            
        return jsonify({
            'userid': user.userid,
            'name': user.name,
            'email': user.email,
            'phone': user.phone
        })
        
    except Exception as e:
        return jsonify({'message': '사용자 정보 조회 중 오류가 발생했습니다.'}), 500 