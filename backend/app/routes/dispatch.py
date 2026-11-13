import os
import uuid
from datetime import datetime
from flask import Blueprint, request, jsonify, current_app
from app import db
from app.models import Order, DispatchEvidence, DispatchImage
from app.utils.auth import token_required
from app.services.pdf_generator import generate_evidence_qr

dispatch_bp = Blueprint('dispatch', __name__)

@dispatch_bp.route('', methods=['GET'])
@token_required
def list_dispatch_evidence(current_user):
    # Retrieve all dispatch evidence for this seller's orders
    orders = Order.query.filter_by(seller_id=current_user.id).all()
    evidence_list = []
    for o in orders:
        if o.dispatch_evidence:
            item = o.dispatch_evidence.to_dict()
            item['order_ref'] = o.order_ref
            item['customer_name'] = o.customer_name
            item['product_name'] = o.product.name if o.product else 'Unknown'
            evidence_list.append(item)
    return jsonify({'dispatch_records': evidence_list}), 200


@dispatch_bp.route('', methods=['POST'])
@token_required
def create_dispatch_evidence(current_user):
    order_id = request.form.get('order_id')
    condition_notes = request.form.get('condition_notes', '').strip()
    seal_intact = request.form.get('packaging_seal_intact', 'true').lower() == 'true'
    tag_attached = request.form.get('tag_attached', 'true').lower() == 'true'
    
    if not order_id:
        return jsonify({'message': 'Order ID is required.'}), 400
        
    order = Order.query.filter_by(id=order_id, seller_id=current_user.id).first()
    if not order:
        return jsonify({'message': 'Order not found.'}), 404
        
    if order.dispatch_evidence:
        return jsonify({'message': 'Dispatch evidence has already been recorded for this order.'}), 409
        
    token_str = f"EVD-{datetime.utcnow().strftime('%Y%m%d')}-{uuid.uuid4().hex[:6].upper()}"
    
    # Generate QR Code image
    qr_url = generate_evidence_qr(token_str, current_app.config['UPLOAD_FOLDER'])
    
    evidence = DispatchEvidence(
        order_id=order.id,
        evidence_token=token_str,
        condition_notes=condition_notes,
        packaging_seal_intact=seal_intact,
        tag_attached=tag_attached,
        qr_code_url=qr_url,
        captured_at=datetime.utcnow()
    )
    db.session.add(evidence)
    db.session.flush() # populate ID for relationship
    
    # Process multiple photographs
    uploaded_files = request.files.getlist('images')
    for file in uploaded_files:
        if file and file.filename != '':
            ext = file.filename.rsplit('.', 1)[-1].lower()
            if ext in current_app.config['ALLOWED_EXTENSIONS']:
                fname = f"disp_{token_str}_{uuid.uuid4().hex[:6]}.{ext}"
                dest = os.path.join(current_app.config['UPLOAD_FOLDER'], 'dispatch', fname)
                file.save(dest)
                
                disp_img = DispatchImage(
                    dispatch_evidence_id=evidence.id,
                    image_url=f"/uploads/dispatch/{fname}",
                    image_type='dispatch_proof'
                )
                db.session.add(disp_img)
                
    db.session.commit()
    return jsonify({
        'message': 'Dispatch evidence securely saved and QR code generated.',
        'evidence': evidence.to_dict()
    }), 201
