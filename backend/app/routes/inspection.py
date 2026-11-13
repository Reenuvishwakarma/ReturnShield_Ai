import os
from datetime import datetime
from flask import Blueprint, request, jsonify, current_app
from app import db
from app.models import ReturnRequest, ReturnInspection, Order, RiskAssessment
from app.utils.auth import token_required
from app.ai.image_compare import compute_image_similarity
from app.ai.risk_engine import calculate_return_risk

inspection_bp = Blueprint('inspection', __name__)

@inspection_bp.route('/<int:return_id>', methods=['GET'])
@token_required
def get_inspection_workspace(current_user, return_id):
    ret = ReturnRequest.query.join(Order).filter(
        ReturnRequest.id == return_id,
        Order.seller_id == current_user.id
    ).first()
    
    if not ret:
        return jsonify({'message': 'Return request record not found.'}), 404
        
    order = ret.order
    dispatch_evidence = order.dispatch_evidence
    
    return jsonify({
        'return_request': ret.to_dict(),
        'order': order.to_dict(),
        'dispatch_evidence': dispatch_evidence.to_dict() if dispatch_evidence else None,
        'inspection': ret.inspection.to_dict() if ret.inspection else None,
        'risk_assessment': ret.risk_assessment.to_dict() if ret.risk_assessment else None
    }), 200


@inspection_bp.route('/<int:return_id>', methods=['POST'])
@token_required
def record_inspection(current_user, return_id):
    ret = ReturnRequest.query.join(Order).filter(
        ReturnRequest.id == return_id,
        Order.seller_id == current_user.id
    ).first()
    
    if not ret:
        return jsonify({'message': 'Return request not found.'}), 404
        
    data = request.get_json() or {}
    physical_condition = data.get('physical_condition', 'Good condition')
    tag_condition = data.get('tag_condition', 'Intact')
    seal_condition = data.get('seal_condition', 'Broken')
    observations = data.get('observations', '').strip()
    
    verified_damaged = physical_condition in ['Damaged', 'Used/worn', 'Wrong product', 'Missing components']
    
    # Run OpenCV assistive image similarity comparison if images exist
    similarity_score = None
    similarity_notes = None
    
    order = ret.order
    if order.dispatch_evidence and order.dispatch_evidence.images and ret.images:
        disp_rel = order.dispatch_evidence.images[0].image_url.lstrip('/')
        ret_rel = ret.images[0].image_url.lstrip('/')
        
        base_dir = os.path.abspath(os.path.dirname(current_app.root_path))
        disp_full = os.path.join(base_dir, 'backend', disp_rel) if not os.path.exists(os.path.join(current_app.config['UPLOAD_FOLDER'], '..', disp_rel)) else os.path.abspath(os.path.join(current_app.config['UPLOAD_FOLDER'], '..', disp_rel))
        ret_full = os.path.abspath(os.path.join(current_app.config['UPLOAD_FOLDER'], '..', ret_rel))
        
        comp_result = compute_image_similarity(disp_full, ret_full)
        similarity_score = comp_result['similarity_score']
        similarity_notes = comp_result['explanation']
        
    inspection = ret.inspection
    if not inspection:
        inspection = ReturnInspection(return_request_id=ret.id)
        db.session.add(inspection)
        
    inspection.physical_condition = physical_condition
    inspection.tag_condition = tag_condition
    inspection.seal_condition = seal_condition
    inspection.observations = observations
    inspection.verified_damaged = verified_damaged
    inspection.similarity_score = similarity_score
    inspection.similarity_notes = similarity_notes
    inspection.inspected_at = datetime.utcnow()
    
    ret.status = 'Inspected'
    order.status = 'Return Inspected'
    
    # Recalculate Risk Assessment with Inspection findings
    hist_count = ReturnRequest.query.join(Order).filter(
        Order.seller_id == current_user.id,
        Order.customer_name == order.customer_name
    ).count()
    
    risk_data = calculate_return_risk(ret, inspection=inspection, historical_customer_returns=hist_count)
    if not ret.risk_assessment:
        ret.risk_assessment = RiskAssessment(return_request_id=ret.id)
        
    ret.risk_assessment.risk_score = risk_data['risk_score']
    ret.risk_assessment.risk_level = risk_data['risk_level']
    ret.risk_assessment.reasons = "||".join(risk_data['reasons'])
    ret.risk_assessment.recommended_action = risk_data['recommended_action']
    
    db.session.commit()
    return jsonify({
        'message': 'Inspection successfully saved and risk profile updated.',
        'inspection': inspection.to_dict(),
        'risk_assessment': ret.risk_assessment.to_dict()
    }), 200
