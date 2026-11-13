from flask import Blueprint, request, jsonify
from app.models import ReturnRequest, Order, RiskAssessment
from app.utils.auth import token_required

risk_bp = Blueprint('risk', __name__)

@risk_bp.route('', methods=['GET'])
@token_required
def get_risk_evaluations(current_user):
    # Fetch all risk assessments associated with seller's return requests
    assessments = RiskAssessment.query.join(ReturnRequest).join(Order).filter(
        Order.seller_id == current_user.id
    ).order_by(RiskAssessment.risk_score.desc()).all()
    
    results = []
    for a in assessments:
        ret = a.return_request
        order = ret.order
        results.append({
            'assessment': a.to_dict(),
            'return_ref': ret.return_ref,
            'return_reason': ret.return_reason,
            'order_ref': order.order_ref,
            'customer_name': order.customer_name,
            'product_name': order.product.name if order.product else 'Unknown',
            'order_amount': order.order_amount,
            'return_date': ret.return_date.strftime('%Y-%m-%d %H:%M') if ret.return_date else None
        })
        
    return jsonify({'risk_evaluations': results}), 200
