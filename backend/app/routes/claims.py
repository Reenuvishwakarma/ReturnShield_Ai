import uuid
from datetime import datetime
from flask import Blueprint, request, jsonify, current_app
from app import db
from app.models import Claim, ReturnRequest, Order, Notification
from app.utils.auth import token_required
from app.services.pdf_generator import generate_claim_dossier_pdf

claims_bp = Blueprint('claims', __name__)

@claims_bp.route('', methods=['GET'])
@token_required
def list_claims(current_user):
    claims = Claim.query.join(ReturnRequest).join(Order).filter(
        Order.seller_id == current_user.id
    ).order_by(Claim.created_at.desc()).all()
    
    out = []
    for c in claims:
        ret = c.return_request
        order = ret.order
        item = c.to_dict()
        item['order_ref'] = order.order_ref
        item['customer_name'] = order.customer_name
        item['product_name'] = order.product.name if order.product else 'N/A'
        item['return_reason'] = ret.return_reason
        out.append(item)
    return jsonify({'claims': out}), 200


@claims_bp.route('', methods=['POST'])
@token_required
def create_claim_dossier(current_user):
    data = request.get_json() or {}
    return_request_id = data.get('return_request_id')
    claim_type = data.get('claim_type', 'Swapped / Damaged Returned Goods')
    loss_amount = data.get('loss_amount')
    
    if not return_request_id:
        return jsonify({'message': 'Return Request ID is required.'}), 400
        
    ret = ReturnRequest.query.join(Order).filter(
        ReturnRequest.id == return_request_id,
        Order.seller_id == current_user.id
    ).first()
    
    if not ret:
        return jsonify({'message': 'Return request record not found.'}), 404
        
    order = ret.order
    final_loss = float(loss_amount) if loss_amount else float(order.order_amount)
    
    claim = ret.claim
    if not claim:
        claim_ref = f"CLM-{datetime.utcnow().strftime('%Y%m%d')}-{uuid.uuid4().hex[:5].upper()}"
        claim = Claim(
            return_request_id=ret.id,
            claim_ref=claim_ref,
            claim_type=claim_type,
            loss_amount=final_loss,
            status='Ready for Platform Submission',
            created_at=datetime.utcnow()
        )
        db.session.add(claim)
        db.session.flush()
    else:
        claim.claim_type = claim_type
        claim.loss_amount = final_loss
        
    # Generate Official Tamper-Evident PDF Dossier
    inspection = ret.inspection
    risk = ret.risk_assessment
    
    pdf_url = generate_claim_dossier_pdf(
        claim=claim,
        order=order,
        return_request=ret,
        inspection=inspection,
        risk=risk,
        upload_folder=current_app.config['UPLOAD_FOLDER']
    )
    claim.pdf_report_path = pdf_url
    order.status = 'Claim Filed'
    
    # Notify seller
    notif = Notification(
        user_id=current_user.id,
        title=f"Dispute Dossier Generated: {claim.claim_ref}",
        message=f"PDF report for Order {order.order_ref} ({order.product.name}) has been compiled and is ready for marketplace ticket submission.",
        severity="info"
    )
    db.session.add(notif)
    
    db.session.commit()
    return jsonify({
        'message': 'Dispute dossier compiled successfully into downloadable PDF.',
        'claim': claim.to_dict()
    }), 201
