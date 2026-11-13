from datetime import datetime
from flask import Blueprint, request, jsonify
from app import db
from app.models import Order, Product
from app.utils.auth import token_required

orders_bp = Blueprint('orders', __name__)

@orders_bp.route('', methods=['GET'])
@token_required
def list_orders(current_user):
    orders = Order.query.filter_by(seller_id=current_user.id).order_by(Order.created_at.desc()).all()
    return jsonify({'orders': [o.to_dict() for o in orders]}), 200


@orders_bp.route('', methods=['POST'])
@token_required
def create_order(current_user):
    data = request.get_json() or {}
    order_ref = data.get('order_ref', '').strip().upper()
    customer_name = data.get('customer_name', '').strip()
    product_id = data.get('product_id')
    quantity = data.get('quantity', 1)
    order_amount = data.get('order_amount')
    
    if not order_ref or not customer_name or not product_id or not order_amount:
        return jsonify({'message': 'Order Reference, Customer Name, Product, and Order Amount are required.'}), 400
        
    product = Product.query.filter_by(id=product_id, seller_id=current_user.id).first()
    if not product:
        return jsonify({'message': 'Selected product not found in your catalog.'}), 404
        
    existing_order = Order.query.filter_by(seller_id=current_user.id, order_ref=order_ref).first()
    if existing_order:
        return jsonify({'message': f'Order reference {order_ref} is already registered.'}), 409
        
    order = Order(
        seller_id=current_user.id,
        product_id=product.id,
        order_ref=order_ref,
        customer_name=customer_name,
        quantity=int(quantity),
        order_amount=float(order_amount),
        dispatch_date=datetime.utcnow(),
        status='Dispatched'
    )
    db.session.add(order)
    db.session.commit()
    
    return jsonify({'message': 'Order registered successfully.', 'order': order.to_dict()}), 201


@orders_bp.route('/<int:order_id>', methods=['GET'])
@token_required
def get_order(current_user, order_id):
    order = Order.query.filter_by(id=order_id, seller_id=current_user.id).first()
    if not order:
        return jsonify({'message': 'Order not found.'}), 404
    return jsonify({'order': order.to_dict()}), 200
