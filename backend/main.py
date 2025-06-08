from flask import Flask
from flask_cors import CORS
from database.database import db
from routes.auth import auth_bp

app = Flask(__name__)
CORS(app)

# Database configuration
app.config['SQLALCHEMY_DATABASE_URI'] = 'sqlite:///restaurant.db'
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False

# Initialize extensions
db.init_app(app)

# Register blueprints
app.register_blueprint(auth_bp, url_prefix='/api/auth')

# Create database tables
with app.app_context():
    db.create_all()

if __name__ == '__main__':
    app.run(port=8080, debug=True)
