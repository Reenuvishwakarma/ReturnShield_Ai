from datetime import datetime
from werkzeug.security import generate_password_hash, check_password_hash
from app import db

class User(db.Model):
    __tablename__ = 'users'
    
    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(100), nullable=False)
    email = db.Column(db.String(120), unique=True, nullable=False, index=True)
    store_name = db.Column(db.String(120), nullable=False)
    password_hash = db.Column(db.String(255), nullable=False)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    
    products = db.relationship('Product', backref='seller', lazy=True, cascade='all, delete-orphan')
    orders = db.relationship('Order', backref='seller', lazy=True, cascade='all, delete-orphan')
    notifications = db.relationship('Notification', backref='user', lazy=True, cascade='all, delete-orphan')

    def set_password(self, password):
        self.password_hash = generate_password_hash(password)

    def check_password(self, password):
        return check_password_hash(self.password_hash, password)

    def to_dict(self):
        return {
            'id': self.id,
            'name': self.name,
            'email': self.email,
            'store_name': self.store_name,
            'created_at': self.created_at.isoformat()
        }


class Product(db.Model):
    __tablename__ = 'products'
    
    id = db.Column(db.Integer, primary_key=True)
    seller_id = db.Column(db.Integer, db.ForeignKey('users.id'), nullable=False)
    name = db.Column(db.String(150), nullable=False)
    sku = db.Column(db.String(60), nullable=False, index=True)
    category = db.Column(db.String(80), nullable=False)
    selling_price = db.Column(db.Float, nullable=False)
    description = db.Column(db.Text, nullable=True)
    image_url = db.Column(db.String(255), nullable=True)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    
    orders = db.relationship('Order', backref='product', lazy=True)

    def to_dict(self):
        return {
            'id': self.id,
            'seller_id': self.seller_id,
            'name': self.name,
            'sku': self.sku,
            'category': self.category,
            'selling_price': self.selling_price,
            'description': self.description,
            'image_url': self.image_url,
            'created_at': self.created_at.isoformat()
        }


class Order(db.Model):
    __tablename__ = 'orders'
    
    id = db.Column(db.Integer, primary_key=True)
    seller_id = db.Column(db.Integer, db.ForeignKey('users.id'), nullable=False)
    product_id = db.Column(db.Integer, db.ForeignKey('products.id'), nullable=False)
    order_ref = db.Column(db.String(80), nullable=False, index=True)
    customer_name = db.Column(db.String(100), nullable=False)
    quantity = db.Column(db.Integer, default=1, nullable=False)
    order_amount = db.Column(db.Float, nullable=False)
    dispatch_date = db.Column(db.DateTime, default=datetime.utcnow)
    status = db.Column(db.String(40), default='Dispatched') # Dispatched, Delivered, Return Requested, Return Inspected, Claim Filed
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    
    dispatch_evidence = db.relationship('DispatchEvidence', backref='order', uselist=False, cascade='all, delete-orphan')
    return_request = db.relationship('ReturnRequest', backref='order', uselist=False, cascade='all, delete-orphan')

    def to_dict(self):
        return {
            'id': self.id,
            'seller_id': self.seller_id,
            'product_id': self.product_id,
            'product_name': self.product.name if self.product else 'Unknown',
            'product_sku': self.product.sku if self.product else 'N/A',
            'order_ref': self.order_ref,
            'customer_name': self.customer_name,
            'quantity': self.quantity,
            'order_amount': self.order_amount,
            'dispatch_date': self.dispatch_date.strftime('%Y-%m-%d %H:%M') if self.dispatch_date else None,
            'status': self.status,
            'created_at': self.created_at.isoformat(),
            'has_dispatch_evidence': self.dispatch_evidence is not None,
            'evidence_token': self.dispatch_evidence.evidence_token if self.dispatch_evidence else None
        }


class DispatchEvidence(db.Model):
    __tablename__ = 'dispatch_evidence'
    
    id = db.Column(db.Integer, primary_key=True)
    order_id = db.Column(db.Integer, db.ForeignKey('orders.id'), nullable=False, unique=True)
    evidence_token = db.Column(db.String(80), unique=True, nullable=False, index=True)
    condition_notes = db.Column(db.Text, nullable=True)
    packaging_seal_intact = db.Column(db.Boolean, default=True)
    tag_attached = db.Column(db.Boolean, default=True)
    qr_code_url = db.Column(db.String(255), nullable=True)
    captured_at = db.Column(db.DateTime, default=datetime.utcnow)
    
    images = db.relationship('DispatchImage', backref='evidence', lazy=True, cascade='all, delete-orphan')

    def to_dict(self):
        return {
            'id': self.id,
            'order_id': self.order_id,
            'evidence_token': self.evidence_token,
            'condition_notes': self.condition_notes,
            'packaging_seal_intact': self.packaging_seal_intact,
            'tag_attached': self.tag_attached,
            'qr_code_url': self.qr_code_url,
            'captured_at': self.captured_at.isoformat(),
            'images': [img.image_url for img in self.images]
        }


class DispatchImage(db.Model):
    __tablename__ = 'dispatch_images'
    
    id = db.Column(db.Integer, primary_key=True)
    dispatch_evidence_id = db.Column(db.Integer, db.ForeignKey('dispatch_evidence.id'), nullable=False)
    image_url = db.Column(db.String(255), nullable=False)
    image_type = db.Column(db.String(50), default='general') # packaging, tag, overall, barcode


class ReturnRequest(db.Model):
    __tablename__ = 'return_requests'
    
    id = db.Column(db.Integer, primary_key=True)
    order_id = db.Column(db.Integer, db.ForeignKey('orders.id'), nullable=False, unique=True)
    return_ref = db.Column(db.String(80), unique=True, nullable=False, index=True)
    return_reason = db.Column(db.String(100), nullable=False) # Product damaged, Wrong product, Size issue, Not as expected, Missing accessory, Other
    customer_remarks = db.Column(db.Text, nullable=True)
    status = db.Column(db.String(40), default='Pending Inspection') # Pending Inspection, Inspected, Claim Raised, Closed
    return_date = db.Column(db.DateTime, default=datetime.utcnow)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    
    images = db.relationship('ReturnImage', backref='return_request', lazy=True, cascade='all, delete-orphan')
    inspection = db.relationship('ReturnInspection', backref='return_request', uselist=False, cascade='all, delete-orphan')
    risk_assessment = db.relationship('RiskAssessment', backref='return_request', uselist=False, cascade='all, delete-orphan')
    claim = db.relationship('Claim', backref='return_request', uselist=False, cascade='all, delete-orphan')

    def to_dict(self):
        return {
            'id': self.id,
            'order_id': self.order_id,
            'order_ref': self.order.order_ref if self.order else 'N/A',
            'product_name': self.order.product.name if self.order and self.order.product else 'N/A',
            'order_amount': self.order.order_amount if self.order else 0,
            'return_ref': self.return_ref,
            'return_reason': self.return_reason,
            'customer_remarks': self.customer_remarks,
            'status': self.status,
            'return_date': self.return_date.strftime('%Y-%m-%d %H:%M') if self.return_date else None,
            'images': [img.image_url for img in self.images],
            'is_inspected': self.inspection is not None,
            'risk_score': self.risk_assessment.risk_score if self.risk_assessment else None,
            'risk_level': self.risk_assessment.risk_level if self.risk_assessment else None
        }


class ReturnImage(db.Model):
    __tablename__ = 'return_images'
    
    id = db.Column(db.Integer, primary_key=True)
    return_request_id = db.Column(db.Integer, db.ForeignKey('return_requests.id'), nullable=False)
    image_url = db.Column(db.String(255), nullable=False)


class ReturnInspection(db.Model):
    __tablename__ = 'return_inspections'
    
    id = db.Column(db.Integer, primary_key=True)
    return_request_id = db.Column(db.Integer, db.ForeignKey('return_requests.id'), nullable=False, unique=True)
    physical_condition = db.Column(db.String(50), nullable=False) # Good condition, Damaged, Used/worn, Wrong product, Missing components, Needs manual review
    tag_condition = db.Column(db.String(50), default='Missing') # Intact, Broken, Missing, Swapped
    seal_condition = db.Column(db.String(50), default='Broken') # Intact, Broken, Tampered
    observations = db.Column(db.Text, nullable=True)
    verified_damaged = db.Column(db.Boolean, default=False)
    similarity_score = db.Column(db.Float, nullable=True) # OpenCV comparison similarity 0.0 - 1.0
    similarity_notes = db.Column(db.String(255), nullable=True)
    inspected_at = db.Column(db.DateTime, default=datetime.utcnow)

    def to_dict(self):
        return {
            'id': self.id,
            'return_request_id': self.return_request_id,
            'physical_condition': self.physical_condition,
            'tag_condition': self.tag_condition,
            'seal_condition': self.seal_condition,
            'observations': self.observations,
            'verified_damaged': self.verified_damaged,
            'similarity_score': self.similarity_score,
            'similarity_notes': self.similarity_notes,
            'inspected_at': self.inspected_at.strftime('%Y-%m-%d %H:%M')
        }


class RiskAssessment(db.Model):
    __tablename__ = 'risk_assessments'
    
    id = db.Column(db.Integer, primary_key=True)
    return_request_id = db.Column(db.Integer, db.ForeignKey('return_requests.id'), nullable=False, unique=True)
    risk_score = db.Column(db.Integer, nullable=False) # 0 to 100
    risk_level = db.Column(db.String(20), nullable=False) # LOW, MEDIUM, HIGH
    reasons = db.Column(db.Text, nullable=False) # JSON list or newline-separated list
    recommended_action = db.Column(db.Text, nullable=False)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)

    def to_dict(self):
        return {
            'id': self.id,
            'return_request_id': self.return_request_id,
            'risk_score': self.risk_score,
            'risk_level': self.risk_level,
            'reasons': self.reasons.split('||') if '||' in self.reasons else [self.reasons],
            'recommended_action': self.recommended_action,
            'created_at': self.created_at.isoformat()
        }


class Claim(db.Model):
    __tablename__ = 'claims'
    
    id = db.Column(db.Integer, primary_key=True)
    return_request_id = db.Column(db.Integer, db.ForeignKey('return_requests.id'), nullable=False, unique=True)
    claim_ref = db.Column(db.String(80), unique=True, nullable=False)
    claim_type = db.Column(db.String(60), nullable=False) # Wrong Product Dispatched Back, Defective Return, Empty Box, Swapped Item
    loss_amount = db.Column(db.Float, nullable=False)
    status = db.Column(db.String(40), default='Ready for Platform Submission') # Ready for Platform Submission, Submitted, Settled, Rejected
    pdf_report_path = db.Column(db.String(255), nullable=True)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)

    def to_dict(self):
        return {
            'id': self.id,
            'return_request_id': self.return_request_id,
            'claim_ref': self.claim_ref,
            'claim_type': self.claim_type,
            'loss_amount': self.loss_amount,
            'status': self.status,
            'pdf_report_path': self.pdf_report_path,
            'created_at': self.created_at.strftime('%Y-%m-%d %H:%M')
        }


class Notification(db.Model):
    __tablename__ = 'notifications'
    
    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey('users.id'), nullable=False)
    title = db.Column(db.String(120), nullable=False)
    message = db.Column(db.Text, nullable=False)
    severity = db.Column(db.String(20), default='info') # info, warning, danger, success
    is_read = db.Column(db.Boolean, default=False)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)

    def to_dict(self):
        return {
            'id': self.id,
            'title': self.title,
            'message': self.message,
            'severity': self.severity,
            'is_read': self.is_read,
            'created_at': self.created_at.strftime('%Y-%m-%d %H:%M')
        }
