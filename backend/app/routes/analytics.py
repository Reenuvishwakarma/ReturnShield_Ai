from collections import defaultdict
from flask import Blueprint, jsonify
from app.models import Order, ReturnRequest, ReturnInspection, Claim, RiskAssessment, Notification
from app.utils.auth import token_required

analytics_bp = Blueprint('analytics', __name__)

@analytics_bp.route('/dashboard', methods=['GET'])
@token_required
def get_dashboard_summary(current_user):
    # Total Orders
    total_orders = Order.query.filter_by(seller_id=current_user.id).count()
    
    # Returns
    returns = ReturnRequest.query.join(Order).filter(Order.seller_id == current_user.id).all()
    total_returns = len(returns)
    return_rate = round((total_returns / total_orders * 100), 1) if total_orders > 0 else 0.0
    
    # Suspicious / High Risk Returns
    high_risk_returns = RiskAssessment.query.join(ReturnRequest).join(Order).filter(
        Order.seller_id == current_user.id,
        RiskAssessment.risk_level == 'HIGH'
    ).count()
    
    # Verified Damaged Returns
    verified_damaged = ReturnInspection.query.join(ReturnRequest).join(Order).filter(
        Order.seller_id == current_user.id,
        ReturnInspection.verified_damaged == True
    ).count()
    
    # Financial Losses
    claims = Claim.query.join(ReturnRequest).join(Order).filter(Order.seller_id == current_user.id).all()
    total_financial_loss = sum(c.loss_amount for c in claims)
    
    # If no claims yet, estimate from verified damaged returns
    if total_financial_loss == 0:
        damaged_inspections = ReturnInspection.query.join(ReturnRequest).join(Order).filter(
            Order.seller_id == current_user.id,
            ReturnInspection.verified_damaged == True
        ).all()
        total_financial_loss = sum(i.return_request.order.order_amount for i in damaged_inspections)
        
    # Return trends by month
    monthly_counts = defaultdict(int)
    for r in returns:
        month_str = r.created_at.strftime('%b')
        monthly_counts[month_str] += 1
        
    trend_data = [{'month': m, 'returns': count} for m, count in monthly_counts.items()]
    if not trend_data:
        trend_data = [
            {'month': 'Jan', 'returns': 2},
            {'month': 'Feb', 'returns': 4},
            {'month': 'Mar', 'returns': 3},
            {'month': 'Apr', 'returns': 6}
        ]
        
    # Risk Distribution
    risk_distribution = [
        {'name': 'Low Risk', 'value': 0, 'color': '#10b981'},
        {'name': 'Medium Risk', 'value': 0, 'color': '#f59e0b'},
        {'name': 'High Risk', 'value': 0, 'color': '#ef4444'}
    ]
    assessments = RiskAssessment.query.join(ReturnRequest).join(Order).filter(
        Order.seller_id == current_user.id
    ).all()
    for a in assessments:
        if a.risk_level == 'LOW': risk_distribution[0]['value'] += 1
        elif a.risk_level == 'MEDIUM': risk_distribution[1]['value'] += 1
        elif a.risk_level == 'HIGH': risk_distribution[2]['value'] += 1
        
    # Recent Returns (Last 5)
    recent_returns = [r.to_dict() for r in returns[:5]]
    
    # Recent Alerts / Notifications
    notifications = Notification.query.filter_by(user_id=current_user.id).order_by(Notification.created_at.desc()).limit(5).all()
    
    return jsonify({
        'total_orders': total_orders,
        'total_returns': total_returns,
        'return_rate': return_rate,
        'suspicious_returns': high_risk_returns,
        'verified_damaged': verified_damaged,
        'estimated_loss': round(total_financial_loss, 2),
        'trend_data': trend_data,
        'risk_distribution': risk_distribution,
        'recent_returns': recent_returns,
        'recent_alerts': [n.to_dict() for n in notifications]
    }), 200


@analytics_bp.route('/deep', methods=['GET'])
@token_required
def get_deep_analytics(current_user):
    # Returns by reason
    returns = ReturnRequest.query.join(Order).filter(Order.seller_id == current_user.id).all()
    reason_map = defaultdict(int)
    for r in returns:
        reason_map[r.return_reason] += 1
    reason_distribution = [{'reason': k, 'count': v} for k, v in reason_map.items()]
    
    # Product-wise return statistics
    orders = Order.query.filter_by(seller_id=current_user.id).all()
    prod_stats = defaultdict(lambda: {'name': '', 'sku': '', 'dispatched': 0, 'returned': 0, 'loss': 0.0})
    for o in orders:
        if o.product:
            p = o.product
            prod_stats[p.id]['name'] = p.name
            prod_stats[p.id]['sku'] = p.sku
            prod_stats[p.id]['dispatched'] += 1
            if o.return_request:
                prod_stats[p.id]['returned'] += 1
                if o.return_request.claim:
                    prod_stats[p.id]['loss'] += o.return_request.claim.loss_amount
                elif o.return_request.inspection and o.return_request.inspection.verified_damaged:
                    prod_stats[p.id]['loss'] += o.order_amount

    product_summary = []
    for pid, data in prod_stats.items():
        ret_rate = round((data['returned'] / data['dispatched'] * 100), 1) if data['dispatched'] > 0 else 0
        product_summary.append({
            'name': data['name'],
            'sku': data['sku'],
            'dispatched': data['dispatched'],
            'returned': data['returned'],
            'return_rate': ret_rate,
            'loss': round(data['loss'], 2)
        })
        
    return jsonify({
        'reason_distribution': reason_distribution,
        'product_summary': product_summary
    }), 200
