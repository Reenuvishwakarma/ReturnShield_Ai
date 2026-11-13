import os
from flask import Flask
from flask_cors import CORS
from flask_sqlalchemy import SQLAlchemy
from config import Config

db = SQLAlchemy()

def create_app(config_class=Config):
    app = Flask(__name__)
    app.config.from_object(config_class)
    
    # Enable CORS for frontend Vite development
    CORS(app, resources={r"/api/*": {"origins": "*"}})
    
    # Initialize SQLAlchemy
    db.init_app(app)
    
    # Ensure upload subdirectories exist
    for sub in ['dispatch', 'returns', 'products', 'reports']:
        path = os.path.join(app.config['UPLOAD_FOLDER'], sub)
        os.makedirs(path, exist_ok=True)
        
    database_dir = os.path.join(os.path.abspath(os.path.dirname(__file__)), '..', '..', 'database')
    os.makedirs(database_dir, exist_ok=True)
    
    # Register API Blueprints
    from app.routes.auth import auth_bp
    from app.routes.products import products_bp
    from app.routes.orders import orders_bp
    from app.routes.dispatch import dispatch_bp
    from app.routes.returns import returns_bp
    from app.routes.inspection import inspection_bp
    from app.routes.risk import risk_bp
    from app.routes.claims import claims_bp
    from app.routes.analytics import analytics_bp
    
    app.register_blueprint(auth_bp, url_prefix='/api/auth')
    app.register_blueprint(products_bp, url_prefix='/api/products')
    app.register_blueprint(orders_bp, url_prefix='/api/orders')
    app.register_blueprint(dispatch_bp, url_prefix='/api/dispatch')
    app.register_blueprint(returns_bp, url_prefix='/api/returns')
    app.register_blueprint(inspection_bp, url_prefix='/api/inspection')
    app.register_blueprint(risk_bp, url_prefix='/api/risk')
    app.register_blueprint(claims_bp, url_prefix='/api/claims')
    app.register_blueprint(analytics_bp, url_prefix='/api/analytics')
    
    # Serve static uploaded evidence images
    from flask import send_from_directory
    @app.route('/uploads/<path:filename>')
    def serve_uploaded_file(filename):
        return send_from_directory(app.config['UPLOAD_FOLDER'], filename)

    @app.route('/api/health')
    def health_check():
        return {"status": "online", "system": "ReturnShield AI Backend v1.0"}
        
    return app
