from datetime import datetime, timedelta
from flask import Blueprint, request, jsonify, current_app
import jwt
from app import db
from app.models import User, Notification
from app.utils.auth import token_required

auth_bp = Blueprint('auth', __name__)

@auth_bp.route('/register', methods=['POST'])
def register():
    data = request.get_json() or {}
    name = data.get('name', '').strip()
    email = data.get('email', '').strip().lower()
    store_name = data.get('store_name', '').strip()
    password = data.get('password', '')
    
    if not name or not email or not password or not store_name:
        return jsonify({'message': 'Please fill out all registration fields.'}), 400
        
    if User.query.filter_by(email=email).first():
        return jsonify({'message': 'An account with this email already exists.'}), 409
        
    user = User(name=name, email=email, store_name=store_name)
    user.set_password(password)
    db.session.add(user)
    db.session.commit()
    
    # Create welcome notification
    notif = Notification(
        user_id=user.id,
        title="Welcome to ReturnShield AI",
        message="Your seller workspace is active. Start by adding your catalog products or recording your first parcel dispatch.",
        severity="success"
    )
    db.session.add(notif)
    db.session.commit()
    
    token = jwt.encode(
        {'sub': user.id, 'exp': datetime.utcnow() + timedelta(days=7)},
        current_app.config['JWT_SECRET_KEY'],
        algorithm='HS256'
    )
    
    return jsonify({
        'message': 'Account created successfully.',
        'token': token,
        'user': user.to_dict()
    }), 201


@auth_bp.route('/login', methods=['POST'])
def login():
    data = request.get_json() or {}
    email = data.get('email', '').strip().lower()
    password = data.get('password', '')
    
    if not email or not password:
        return jsonify({'message': 'Email and password are required.'}), 400
        
    user = User.query.filter_by(email=email).first()
    if not user or not user.check_password(password):
        return jsonify({'message': 'Invalid email or password credentials.'}), 401
        
    token = jwt.encode(
        {'sub': user.id, 'exp': datetime.utcnow() + timedelta(days=7)},
        current_app.config['JWT_SECRET_KEY'],
        algorithm='HS256'
    )
    
    return jsonify({
        'message': 'Sign in successful.',
        'token': token,
        'user': user.to_dict()
    }), 200


@auth_bp.route('/me', methods=['GET'])
@token_required
def get_current_user(current_user):
    return jsonify({'user': current_user.to_dict()}), 200
