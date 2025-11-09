from app import app, db, Room, Admin
from werkzeug.security import generate_password_hash
import json
import os

def recreate_database():
    """Completely recreate database with correct schema"""
    
    with app.app_context():
        print("🔄 Recreating database with proper multi-room support...")
        
        # Backup existing room data
        rooms_backup = []
        admins_backup = []
        
        try:
            for room in Room.query.all():
                rooms_backup.append({
                    'name': room.name,
                    'type': room.type,
                    'price': room.price,
                    'capacity': room.capacity,
                    'description': room.description,
                    'amenities': room.amenities,
                    'images': room.images,
                    'videos': room.videos,
                    'available': room.available,
                    'total_rooms': getattr(room, 'total_rooms', 5)
                })
            print(f"📦 Backed up {len(rooms_backup)} rooms")
            
            for admin in Admin.query.all():
                admins_backup.append({
                    'username': admin.username,
                    'password_hash': admin.password_hash,
                    'email': admin.email
                })
            print(f"📦 Backed up {len(admins_backup)} admin accounts")
        except:
            print("⚠️  Creating fresh database...")
        
        # Remove old database
        if os.path.exists('hotel.db'):
            os.remove('hotel.db')
            print("🗑️  Old database removed")
        
        # Create all tables with new schema
        db.create_all()
        print("✨ Created new database with updated schema")
        
        # Restore or create data
        if rooms_backup:
            for room_data in rooms_backup:
                room = Room(**room_data)
                db.session.add(room)
            print(f"✅ Restored {len(rooms_backup)} rooms")
        else:
            # Create sample rooms
            sample_rooms = [
                {
                    'name': 'Deluxe Ocean View Suite',
                    'type': 'Suite',
                    'price': 299.99,
                    'capacity': 2,
                    'description': 'Experience luxury in our spacious ocean view suite featuring a king-size bed, private balcony, and stunning panoramic views of the coastline.',
                    'amenities': json.dumps(['King Bed', 'Ocean View', 'Private Balcony', 'Mini Bar', 'WiFi', 'Smart TV']),
                    'images': json.dumps(['https://images.unsplash.com/photo-1582719508461-905c673771fd?w=800', 'https://images.unsplash.com/photo-1566665797739-1674de7a421a?w=800']),
                    'videos': json.dumps(['https://player.vimeo.com/video/251650410']),
                    'available': True,
                    'total_rooms': 5
                },
                {
                    'name': 'Executive Business Room',
                    'type': 'Business',
                    'price': 199.99,
                    'capacity': 2,
                    'description': 'Designed for the modern business traveler with workspace and high-speed internet.',
                    'amenities': json.dumps(['Queen Bed', 'Work Desk', 'High-Speed WiFi', 'Smart TV']),
                    'images': json.dumps(['https://images.unsplash.com/photo-1590490360182-c33d57733427?w=800']),
                    'videos': json.dumps([]),
                    'available': True,
                    'total_rooms': 10
                },
                {
                    'name': 'Family Garden Room',
                    'type': 'Family',
                    'price': 249.99,
                    'capacity': 4,
                    'description': 'Spacious family room with garden views and plenty of space for everyone.',
                    'amenities': json.dumps(['Two Queen Beds', 'Garden View', 'Mini Fridge', 'WiFi']),
                    'images': json.dumps(['https://images.unsplash.com/photo-1611892440504-42a792e24d32?w=800']),
                    'videos': json.dumps([]),
                    'available': True,
                    'total_rooms': 8
                },
                {
                    'name': 'Cozy Standard Room',
                    'type': 'Standard',
                    'price': 129.99,
                    'capacity': 2,
                    'description': 'Comfortable and affordable accommodation with all essential amenities.',
                    'amenities': json.dumps(['Queen Bed', 'WiFi', 'TV', 'Air Conditioning']),
                    'images': json.dumps(['https://images.unsplash.com/photo-1631049035374-b2d0ef76c988?w=800']),
                    'videos': json.dumps([]),
                    'available': True,
                    'total_rooms': 15
                }
            ]
            
            for room_data in sample_rooms:
                room = Room(**room_data)
                db.session.add(room)
            print(f"✅ Created {len(sample_rooms)} sample rooms")
        
        if admins_backup:
            for admin_data in admins_backup:
                admin = Admin(**admin_data)
                db.session.add(admin)
            print(f"✅ Restored {len(admins_backup)} admin accounts")
        else:
            # Create default admin
            admin = Admin(
                username='admin',
                password_hash=generate_password_hash('admin123'),
                email='admin@hotel.com'
            )
            db.session.add(admin)
            print("✅ Created default admin (username: admin, password: admin123)")
        
        db.session.commit()
        
        print("\n" + "="*60)
        print("🎉 DATABASE READY FOR MULTI-ROOM BOOKINGS!")
        print("="*60)
        print("\n📊 Current Inventory:")
        for room in Room.query.all():
            print(f"   • {room.name} ({room.type})")
            print(f"     - {room.total_rooms} units @ ${room.price}/night")
        print("\n🚀 Next Steps:")
        print("   1. Run: python app.py")
        print("   2. Visit: http://localhost:8000/booking-select")
        print("   3. Test multi-room booking!")
        print("="*60)

if __name__ == '__main__':
    response = input("⚠️  This will recreate the database. All bookings will be lost. Continue? (yes/no): ")
    if response.lower() in ['yes', 'y']:
        recreate_database()
    else:
        print("❌ Operation cancelled")