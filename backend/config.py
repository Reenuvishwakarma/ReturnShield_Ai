import os

BASE_DIR = os.path.abspath(os.path.dirname(__file__))

class Config:
    SECRET_KEY = os.environ.get('SECRET_KEY', 'returnshield-ai-jwt-dev-key-992147')
    JWT_SECRET_KEY = os.environ.get('JWT_SECRET_KEY', 'jwt-super-secret-key-384192')
    
    # SQLite modular path - easily swapped to MySQL
    # e.g., 'mysql+pymysql://user:password@localhost/returnshield'
    SQLALCHEMY_DATABASE_URI = os.environ.get(
        'DATABASE_URL', 
        f"sqlite:///{os.path.join(BASE_DIR, '..', 'database', 'returnshield.db')}"
    )
    SQLALCHEMY_TRACK_MODIFICATIONS = False
    
    # File Upload Directory
    UPLOAD_FOLDER = os.path.join(BASE_DIR, 'uploads')
    MAX_CONTENT_LENGTH = 16 * 1024 * 1024  # 16 MB max upload
    ALLOWED_EXTENSIONS = {'png', 'jpg', 'jpeg', 'webp'}
