import os
import uuid
from flask import Blueprint, request, jsonify, current_app
from werkzeug.utils import secure_filename
from app import db
from app.models import Product
from app.utils.auth import token_required

products_bp = Blueprint('products', __name__)

@products_bp.route('', methods=['GET'])
@token_required
def list_products(current_user):
    products = Product.query.filter_by(seller_id=current_user.id).order_by(Product.created_at.desc()).all()
    return jsonify({'products': [p.to_dict() for p in products]}), 200


@products_bp.route('', methods=['POST'])
@token_required
def create_product(current_user):
    name = request.form.get('name', '').strip()
    sku = request.form.get('sku', '').strip().upper()
    category = request.form.get('category', '').strip()
    selling_price = request.form.get('selling_price')
    description = request.form.get('description', '').strip()
    
    if not name or not sku or not category or not selling_price:
        return jsonify({'message': 'Product Name, SKU, Category, and Price are required.'}), 400
        
    try:
        price = float(selling_price)
    except ValueError:
        return jsonify({'message': 'Selling price must be a valid number.'}), 400
        
    existing = Product.query.filter_by(seller_id=current_user.id, sku=sku).first()
    if existing:
        return jsonify({'message': f'Product with SKU {sku} already exists.'}), 409
        
    image_url = None
    if 'image' in request.files:
        file = request.files['image']
        if file and file.filename != '':
            ext = file.filename.rsplit('.', 1)[-1].lower()
            if ext in current_app.config['ALLOWED_EXTENSIONS']:
                fname = f"prod_{uuid.uuid4().hex[:8]}.{ext}"
                dest = os.path.join(current_app.config['UPLOAD_FOLDER'], 'products', fname)
                file.save(dest)
                image_url = f"/uploads/products/{fname}"
                
    product = Product(
        seller_id=current_user.id,
        name=name,
        sku=sku,
        category=category,
        selling_price=price,
        description=description,
        image_url=image_url
    )
    db.session.add(product)
    db.session.commit()
    
    return jsonify({'message': 'Product created successfully.', 'product': product.to_dict()}), 201


@products_bp.route('/<int:product_id>', methods=['PUT'])
@token_required
def update_product(current_user, product_id):
    product = Product.query.filter_by(id=product_id, seller_id=current_user.id).first()
    if not product:
        return jsonify({'message': 'Product not found.'}), 404
        
    name = request.form.get('name')
    category = request.form.get('category')
    selling_price = request.form.get('selling_price')
    description = request.form.get('description')
    
    if name: product.name = name.strip()
    if category: product.category = category.strip()
    if selling_price:
        try: product.selling_price = float(selling_price)
        except ValueError: return jsonify({'message': 'Invalid price value.'}), 400
    if description is not None: product.description = description.strip()
    
    if 'image' in request.files:
        file = request.files['image']
        if file and file.filename != '':
            ext = file.filename.rsplit('.', 1)[-1].lower()
            if ext in current_app.config['ALLOWED_EXTENSIONS']:
                fname = f"prod_{uuid.uuid4().hex[:8]}.{ext}"
                dest = os.path.join(current_app.config['UPLOAD_FOLDER'], 'products', fname)
                file.save(dest)
                product.image_url = f"/uploads/products/{fname}"
                
    db.session.commit()
    return jsonify({'message': 'Product updated successfully.', 'product': product.to_dict()}), 200


@products_bp.route('/<int:product_id>', methods=['DELETE'])
@token_required
def delete_product(current_user, product_id):
    product = Product.query.filter_by(id=product_id, seller_id=current_user.id).first()
    if not product:
        return jsonify({'message': 'Product not found.'}), 404
        
    db.session.delete(product)
    db.session.commit()
    return jsonify({'message': 'Product deleted successfully.'}), 200
