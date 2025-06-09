from flask import Flask
from flask_cors import CORS
from database.database import db
from routes.auth import auth_bp
from routes.reservation import reservation_bp

app = Flask(__name__)

# CORS 설정 수정
cors = CORS(app, resources={
    r"/api/*": {
        "origins": ["http://localhost:5173"],
        "methods": ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
        "allow_headers": ["Content-Type", "Authorization"]
    }
})

# Database configuration
app.config['SQLALCHEMY_DATABASE_URI'] = 'sqlite:///restaurant.db'
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False

# Initialize extensions
db.init_app(app)

# Register blueprints
app.register_blueprint(auth_bp, url_prefix='/api/auth')
app.register_blueprint(reservation_bp, url_prefix='/api/reservations')

# Create database tables
with app.app_context():
    db.create_all()

if __name__ == '__main__':
    app.run(port=8080, debug=True)
