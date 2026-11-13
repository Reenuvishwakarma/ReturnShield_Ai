import os
import uuid
from datetime import datetime
from flask import Blueprint, request, jsonify, current_app
from app import db
from app.models import Order, ReturnRequest, ReturnImage
from app.utils.auth import token_required
from app.ai.risk_engine import calculate_return_risk
from app.models import RiskAssessment

returns_bp = Blueprint('returns', __name__)

@returns_bp.route('', methods=['GET'])
@token_required
def list_returns(current_user):
    # Returns for this seller's orders
    returns = ReturnRequest.query.join(Order).filter(Order.seller_id == current_user.id).order_by(ReturnRequest.created_at.desc()).all()
    return jsonify({'returns': [r.to_dict() for r in returns]}), 200


@returns_bp.route('', methods=['POST'])
@token_required
def create_return_request(current_user):
    order_ref = request.form.get('order_ref', '').strip().upper()
    return_reason = request.form.get('return_reason', '').strip()
    customer_remarks = request.form.get('customer_remarks', '').strip()
    
    if not order_ref or not return_reason:
        return jsonify({'message': 'Order Reference and Return Reason are required.'}), 400
        
    order = Order.query.filter_by(seller_id=current_user.id, order_ref=order_ref).first()
    if not order:
        return jsonify({'message': f'Order {order_ref} not found in your seller account.'}), 404
        
    if order.return_request:
        return jsonify({'message': f'A return request is already registered for order {order_ref}.'}), 409
        
    return_ref = f"RET-{datetime.utcnow().strftime('%Y%m%d')}-{uuid.uuid4().hex[:5].upper()}"
    
    return_req = ReturnRequest(
        order_id=order.id,
        return_ref=return_ref,
        return_reason=return_reason,
        customer_remarks=customer_remarks,
        status='Pending Inspection',
        return_date=datetime.utcnow()
    )
    db.session.add(return_req)
    order.status = 'Return Requested'
    db.session.flush()
    
    # Process return photos (photos sent by customer or courier receiving station)
    uploaded_files = request.files.getlist('images')
    for file in uploaded_files:
        if file and file.filename != '':
            ext = file.filename.rsplit('.', 1)[-1].lower()
            if ext in current_app.config['ALLOWED_EXTENSIONS']:
                fname = f"ret_{return_ref}_{uuid.uuid4().hex[:6]}.{ext}"
                dest = os.path.join(current_app.config['UPLOAD_FOLDER'], 'returns', fname)
                file.save(dest)
                
                ret_img = ReturnImage(
                    return_request_id=return_req.id,
                    image_url=f"/uploads/returns/{fname}"
                )
                db.session.add(ret_img)
                
    # Calculate initial risk assessment based on frequency & category
    hist_count = ReturnRequest.query.join(Order).filter(
        Order.seller_id == current_user.id,
        Order.customer_name == order.customer_name
    ).count()
    
    risk_data = calculate_return_risk(return_req, inspection=None, historical_customer_returns=hist_count)
    assessment = RiskAssessment(
        return_request_id=return_req.id,
        risk_score=risk_data['risk_score'],
        risk_level=risk_data['risk_level'],
        reasons="||".join(risk_data['reasons']),
        recommended_action=risk_data['recommended_action']
    )
    db.session.add(assessment)
    
    db.session.commit()
    return jsonify({
        'message': 'Return request logged and preliminary risk assessment generated.',
        'return_request': return_req.to_dict()
    }), 201
