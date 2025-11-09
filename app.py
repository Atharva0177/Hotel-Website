from flask import Flask, render_template, request, redirect, url_for, flash, jsonify, session
from flask_sqlalchemy import SQLAlchemy
from werkzeug.security import generate_password_hash, check_password_hash
from datetime import datetime, timedelta
from functools import wraps
import os
import json

app = Flask(__name__)
app.config['SECRET_KEY'] = 'your-secret-key-change-this-in-production'
app.config['SQLALCHEMY_DATABASE_URI'] = 'sqlite:///hotel.db'
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False

db = SQLAlchemy(app)

# Add custom Jinja2 filter for JSON parsing
@app.template_filter('from_json')
def from_json_filter(value):
    """Convert JSON string to Python object"""
    try:
        return json.loads(value)
    except:
        return []

# Models
class Room(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(100), nullable=False)
    type = db.Column(db.String(50), nullable=False)
    price = db.Column(db.Float, nullable=False)
    capacity = db.Column(db.Integer, nullable=False)
    description = db.Column(db.Text, nullable=False)
    amenities = db.Column(db.Text, nullable=False)  # JSON string
    images = db.Column(db.Text, nullable=False)  # JSON string of image URLs
    videos = db.Column(db.Text)  # JSON string of video URLs
    available = db.Column(db.Boolean, default=True)
    total_rooms = db.Column(db.Integer, default=1)  # NEW: Total number of this room type
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    
    bookings = db.relationship('Booking', backref='room', lazy=True)
    booking_items = db.relationship('BookingItem', backref='room', lazy=True)

class Booking(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    guest_name = db.Column(db.String(100), nullable=False)
    guest_email = db.Column(db.String(120), nullable=False)
    guest_phone = db.Column(db.String(20), nullable=False)
    check_in = db.Column(db.Date, nullable=False)
    check_out = db.Column(db.Date, nullable=False)
    special_requests = db.Column(db.Text)
    total_price = db.Column(db.Float, nullable=False)
    status = db.Column(db.String(20), default='pending')  # pending, confirmed, cancelled
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    
    # NEW: Relationship to booking items
    items = db.relationship('BookingItem', backref='booking', lazy=True, cascade='all, delete-orphan')
    
    # Keep old room_id for backward compatibility with existing bookings
    room_id = db.Column(db.Integer, db.ForeignKey('room.id'), nullable=True)
    guests = db.Column(db.Integer, nullable=True)

# NEW: BookingItem model for multiple rooms per booking
class BookingItem(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    booking_id = db.Column(db.Integer, db.ForeignKey('booking.id'), nullable=False)
    room_id = db.Column(db.Integer, db.ForeignKey('room.id'), nullable=False)
    quantity = db.Column(db.Integer, default=1)  # Number of rooms of this type
    guests = db.Column(db.Integer, nullable=False)  # Guests for this room
    price_per_night = db.Column(db.Float, nullable=False)
    subtotal = db.Column(db.Float, nullable=False)

class Admin(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    username = db.Column(db.String(80), unique=True, nullable=False)
    password_hash = db.Column(db.String(200), nullable=False)
    email = db.Column(db.String(120), unique=True, nullable=False)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)

# Admin authentication decorator
def admin_required(f):
    @wraps(f)
    def decorated_function(*args, **kwargs):
        if 'admin_id' not in session:
            flash('Please log in to access the admin panel.', 'warning')
            return redirect(url_for('admin_login'))
        return f(*args, **kwargs)
    return decorated_function

# Helper function to check room availability
def get_available_rooms(room_id, check_in, check_out):
    """Calculate how many rooms of a type are available for given dates"""
    room = Room.query.get(room_id)
    if not room:
        return 0
    
    # Get all overlapping bookings for this room
    overlapping_bookings = db.session.query(
        db.func.coalesce(db.func.sum(BookingItem.quantity), 0)
    ).join(Booking).filter(
        BookingItem.room_id == room_id,
        Booking.status.in_(['pending', 'confirmed']),
        Booking.check_in < check_out,
        Booking.check_out > check_in
    ).scalar()
    
    # Also check legacy bookings (backward compatibility)
    legacy_bookings = Booking.query.filter(
        Booking.room_id == room_id,
        Booking.status.in_(['pending', 'confirmed']),
        Booking.check_in < check_out,
        Booking.check_out > check_in
    ).count()
    
    total_booked = overlapping_bookings + legacy_bookings
    available = room.total_rooms - total_booked
    
    return max(0, available)

# Public Routes
@app.route('/')
def index():
    featured_rooms = Room.query.filter_by(available=True).limit(6).all()
    return render_template('index.html', rooms=featured_rooms)

@app.route('/rooms')
def rooms():
    room_type = request.args.get('type', 'all')
    if room_type == 'all':
        all_rooms = Room.query.filter_by(available=True).all()
    else:
        all_rooms = Room.query.filter_by(available=True, type=room_type).all()
    
    return render_template('rooms.html', rooms=all_rooms, current_type=room_type)

@app.route('/room/<int:room_id>')
def room_detail(room_id):
    room = Room.query.get_or_404(room_id)
    room.amenities_list = json.loads(room.amenities)
    room.images_list = json.loads(room.images)
    room.videos_list = json.loads(room.videos) if room.videos else []
    return render_template('room-detail.html', room=room)

# Update the booking_select route (around line 143-147)

@app.route('/booking-select')
def booking_select():
    """New route for selecting multiple rooms"""
    all_rooms = Room.query.filter_by(available=True).all()
    
    # Convert rooms to JSON-serializable format
    rooms_data = []
    for room in all_rooms:
        rooms_data.append({
            'id': room.id,
            'name': room.name,
            'type': room.type,
            'price': room.price,
            'capacity': room.capacity,
            'description': room.description,
            'total_rooms': room.total_rooms,
            'images': json.loads(room.images),
            'amenities': json.loads(room.amenities)
        })
    
    return render_template('booking-select.html', rooms=all_rooms, rooms_json=rooms_data)

@app.route('/booking/<int:room_id>')
def booking_form(room_id):
    """Single room booking - redirects to multi-room booking"""
    return redirect(url_for('booking_select'))

@app.route('/booking-multi')
def booking_multi():
    """Multi-room booking form"""
    # Get selected rooms from query string
    rooms_param = request.args.get('rooms', '')
    selected_rooms = []
    
    if rooms_param:
        try:
            # Format: room_id:quantity,room_id:quantity
            for item in rooms_param.split(','):
                if ':' in item:
                    room_id, quantity = item.split(':')
                    room = Room.query.get(int(room_id))
                    if room:
                        selected_rooms.append({
                            'room': room,
                            'quantity': int(quantity)
                        })
        except:
            pass
    
    return render_template('booking-multi.html', selected_rooms=selected_rooms)

@app.route('/api/check-availability', methods=['POST'])
def check_availability():
    data = request.json
    room_id = data.get('room_id')
    check_in = datetime.strptime(data.get('check_in'), '%Y-%m-%d').date()
    check_out = datetime.strptime(data.get('check_out'), '%Y-%m-%d').date()
    quantity = data.get('quantity', 1)
    
    available = get_available_rooms(room_id, check_in, check_out)
    
    return jsonify({
        'available': available >= quantity,
        'available_count': available,
        'requested': quantity
    })

@app.route('/book', methods=['POST'])
def book_room():
    try:
        # Get form data
        guest_name = request.form.get('guest_name')
        guest_email = request.form.get('guest_email')
        guest_phone = request.form.get('guest_phone')
        check_in = datetime.strptime(request.form.get('check_in'), '%Y-%m-%d').date()
        check_out = datetime.strptime(request.form.get('check_out'), '%Y-%m-%d').date()
        special_requests = request.form.get('special_requests')
        
        nights = (check_out - check_in).days
        
        # Get selected rooms data (JSON string)
        rooms_data = request.form.get('rooms_data')
        if not rooms_data:
            flash('Please select at least one room', 'danger')
            return redirect(url_for('booking_select'))
        
        selected_rooms = json.loads(rooms_data)
        
        # Validate availability for all rooms
        total_price = 0
        booking_items_data = []
        
        for item in selected_rooms:
            room = Room.query.get(item['room_id'])
            if not room:
                flash(f'Room not found', 'danger')
                return redirect(url_for('booking_select'))
            
            available = get_available_rooms(room.id, check_in, check_out)
            if available < item['quantity']:
                flash(f'Only {available} {room.name} available for selected dates', 'danger')
                return redirect(url_for('booking_select'))
            
            subtotal = nights * room.price * item['quantity']
            total_price += subtotal
            
            booking_items_data.append({
                'room': room,
                'quantity': item['quantity'],
                'guests': item['guests'],
                'subtotal': subtotal
            })
        
        # Create booking
        booking = Booking(
            guest_name=guest_name,
            guest_email=guest_email,
            guest_phone=guest_phone,
            check_in=check_in,
            check_out=check_out,
            special_requests=special_requests,
            total_price=total_price,
            status='confirmed'
        )
        
        db.session.add(booking)
        db.session.flush()  # Get booking ID
        
        # Create booking items
        for item_data in booking_items_data:
            booking_item = BookingItem(
                booking_id=booking.id,
                room_id=item_data['room'].id,
                quantity=item_data['quantity'],
                guests=item_data['guests'],
                price_per_night=item_data['room'].price,
                subtotal=item_data['subtotal']
            )
            db.session.add(booking_item)
        
        db.session.commit()
        
        flash('Booking confirmed successfully!', 'success')
        return redirect(url_for('booking_success', booking_id=booking.id))
    except Exception as e:
        db.session.rollback()
        flash(f'Error processing booking: {str(e)}', 'danger')
        return redirect(url_for('booking_select'))

@app.route('/booking-success/<int:booking_id>')
def booking_success(booking_id):
    booking = Booking.query.get_or_404(booking_id)
    return render_template('booking-success-multi.html', booking=booking)

# Admin Routes
@app.route('/admin/login', methods=['GET', 'POST'])
def admin_login():
    if request.method == 'POST':
        username = request.form.get('username')
        password = request.form.get('password')
        
        admin = Admin.query.filter_by(username=username).first()
        
        if admin and check_password_hash(admin.password_hash, password):
            session['admin_id'] = admin.id
            session['admin_username'] = admin.username
            flash('Welcome back!', 'success')
            return redirect(url_for('admin_dashboard'))
        else:
            flash('Invalid username or password', 'danger')
    
    return render_template('admin/login.html')

@app.route('/admin/logout')
def admin_logout():
    session.pop('admin_id', None)
    session.pop('admin_username', None)
    flash('You have been logged out.', 'info')
    return redirect(url_for('admin_login'))

@app.route('/admin/dashboard')
@admin_required
def admin_dashboard():
    total_rooms = Room.query.count()
    available_rooms = Room.query.filter_by(available=True).count()
    total_bookings = Booking.query.count()
    pending_bookings = Booking.query.filter_by(status='pending').count()
    
    # Recent bookings
    recent_bookings = Booking.query.order_by(Booking.created_at.desc()).limit(5).all()
    
    # Revenue calculation
    total_revenue = db.session.query(db.func.sum(Booking.total_price)).filter(
        Booking.status.in_(['confirmed', 'pending'])
    ).scalar() or 0
    
    return render_template('admin/dashboard.html', 
                         total_rooms=total_rooms,
                         available_rooms=available_rooms,
                         total_bookings=total_bookings,
                         pending_bookings=pending_bookings,
                         recent_bookings=recent_bookings,
                         total_revenue=total_revenue)

@app.route('/admin/rooms')
@admin_required
def admin_rooms():
    all_rooms = Room.query.order_by(Room.created_at.desc()).all()
    return render_template('admin/manage-rooms.html', rooms=all_rooms)

@app.route('/admin/room/add', methods=['POST'])
@admin_required
def add_room():
    try:
        room = Room(
            name=request.form.get('name'),
            type=request.form.get('type'),
            price=float(request.form.get('price')),
            capacity=int(request.form.get('capacity')),
            description=request.form.get('description'),
            amenities=request.form.get('amenities'),
            images=request.form.get('images'),
            videos=request.form.get('videos', '[]'),
            available=request.form.get('available') == 'true',
            total_rooms=int(request.form.get('total_rooms', 1))
        )
        
        db.session.add(room)
        db.session.commit()
        
        flash('Room added successfully!', 'success')
    except Exception as e:
        flash(f'Error adding room: {str(e)}', 'danger')
    
    return redirect(url_for('admin_rooms'))

@app.route('/admin/room/edit/<int:room_id>', methods=['POST'])
@admin_required
def edit_room(room_id):
    try:
        room = Room.query.get_or_404(room_id)
        
        room.name = request.form.get('name')
        room.type = request.form.get('type')
        room.price = float(request.form.get('price'))
        room.capacity = int(request.form.get('capacity'))
        room.description = request.form.get('description')
        room.amenities = request.form.get('amenities')
        room.images = request.form.get('images')
        room.videos = request.form.get('videos', '[]')
        room.available = request.form.get('available') == 'true'
        room.total_rooms = int(request.form.get('total_rooms', 1))
        
        db.session.commit()
        
        flash('Room updated successfully!', 'success')
    except Exception as e:
        flash(f'Error updating room: {str(e)}', 'danger')
    
    return redirect(url_for('admin_rooms'))

@app.route('/admin/room/delete/<int:room_id>', methods=['POST'])
@admin_required
def delete_room(room_id):
    try:
        room = Room.query.get_or_404(room_id)
        
        # Check if there are active bookings
        active_bookings = Booking.query.filter(
            Booking.room_id == room_id,
            Booking.status.in_(['pending', 'confirmed'])
        ).count()
        
        active_items = BookingItem.query.join(Booking).filter(
            BookingItem.room_id == room_id,
            Booking.status.in_(['pending', 'confirmed'])
        ).count()
        
        if active_bookings > 0 or active_items > 0:
            flash('Cannot delete room with active bookings!', 'warning')
        else:
            db.session.delete(room)
            db.session.commit()
            flash('Room deleted successfully!', 'success')
    except Exception as e:
        flash(f'Error deleting room: {str(e)}', 'danger')
    
    return redirect(url_for('admin_rooms'))

@app.route('/admin/bookings')
@admin_required
def admin_bookings():
    status_filter = request.args.get('status', 'all')
    
    if status_filter == 'all':
        all_bookings = Booking.query.order_by(Booking.created_at.desc()).all()
    else:
        all_bookings = Booking.query.filter_by(status=status_filter).order_by(Booking.created_at.desc()).all()
    
    return render_template('admin/manage-bookings.html', bookings=all_bookings, current_status=status_filter)

@app.route('/admin/booking/update/<int:booking_id>', methods=['POST'])
@admin_required
def update_booking_status(booking_id):
    try:
        booking = Booking.query.get_or_404(booking_id)
        booking.status = request.form.get('status')
        db.session.commit()
        
        flash('Booking status updated successfully!', 'success')
    except Exception as e:
        flash(f'Error updating booking: {str(e)}', 'danger')
    
    return redirect(url_for('admin_bookings'))

@app.route('/admin/booking/delete/<int:booking_id>', methods=['POST'])
@admin_required
def delete_booking(booking_id):
    try:
        booking = Booking.query.get_or_404(booking_id)
        db.session.delete(booking)
        db.session.commit()
        
        flash('Booking deleted successfully!', 'success')
    except Exception as e:
        flash(f'Error deleting booking: {str(e)}', 'danger')
    
    return redirect(url_for('admin_bookings'))

# API Routes for AJAX
@app.route('/api/rooms')
def api_rooms():
    rooms = Room.query.filter_by(available=True).all()
    return jsonify([{
        'id': room.id,
        'name': room.name,
        'type': room.type,
        'price': room.price,
        'capacity': room.capacity,
        'total_rooms': room.total_rooms,
        'images': json.loads(room.images)
    } for room in rooms])

if __name__ == '__main__':
    with app.app_context():
        db.create_all()
    app.run(debug=True, host='0.0.0.0', port=8000)