import functools
from flask import request, jsonify, current_app
import jwt
from app.models import User

def token_required(f):
    @functools.wraps(f)
    def decorated(*args, **kwargs):
        token = None
        if 'Authorization' in request.headers:
            auth_header = request.headers['Authorization']
            parts = auth_header.split()
            if len(parts) == 2 and parts[0] == 'Bearer':
                token = parts[1]
                
        if not token:
            return jsonify({'message': 'Authorization token is missing or malformed.'}), 401
            
        try:
            payload = jwt.decode(token, current_app.config['JWT_SECRET_KEY'], algorithms=['HS256'])
            current_user = User.query.get(payload['sub'])
            if not current_user:
                return jsonify({'message': 'User record associated with token not found.'}), 401
        except jwt.ExpiredSignatureError:
            return jsonify({'message': 'Authentication token has expired. Please sign in again.'}), 401
        except jwt.InvalidTokenError:
            return jsonify({'message': 'Invalid token signature.'}), 401
            
        return f(current_user, *args, **kwargs)
    return decorated
