from database.database import db

class Reservation(db.Model):
    __tablename__ = 'reservations'
    
    id = db.Column(db.Integer, primary_key=True)
    userid = db.Column(db.String(80), db.ForeignKey('users.userid'), nullable=False)
    reservation_date = db.Column(db.Date, nullable=False)
    time_slot = db.Column(db.String(10), nullable=False)  # 'lunch' or 'dinner'
    table_number = db.Column(db.Integer, nullable=False)
    customer_name = db.Column(db.String(80), nullable=False)
    phone_number = db.Column(db.String(20), nullable=False)
    card_bank = db.Column(db.String(50), nullable=False)
    card_number = db.Column(db.String(20), nullable=False)
    guest_count = db.Column(db.Integer, nullable=False)
    created_at = db.Column(db.DateTime, server_default=db.func.now())

    # Relationship with User model
    user = db.relationship('User', backref=db.backref('reservations', lazy=True))

    def __repr__(self):
        return f'<Reservation {self.id} for {self.userid} on {self.reservation_date}>' 