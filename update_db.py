from app import app, db
import sqlite3
import os

def update_database():
    with app.app_context():
        db_path = 'instance/hotel.db'
        
        # Connect directly to SQLite
        conn = sqlite3.connect(db_path)
        cursor = conn.cursor()
        
        try:
            # Check if total_rooms column exists
            cursor.execute("PRAGMA table_info(room)")
            columns = [column[1] for column in cursor.fetchall()]
            
            if 'total_rooms' not in columns:
                print("Adding 'total_rooms' column to room table...")
                cursor.execute("ALTER TABLE room ADD COLUMN total_rooms INTEGER DEFAULT 5")
                conn.commit()
                print("✓ Column 'total_rooms' added successfully!")
            else:
                print("✓ Column 'total_rooms' already exists")
            
            # Create BookingItem table if it doesn't exist
            cursor.execute("""
                CREATE TABLE IF NOT EXISTS booking_item (
                    id INTEGER PRIMARY KEY AUTOINCREMENT,
                    booking_id INTEGER NOT NULL,
                    room_id INTEGER NOT NULL,
                    quantity INTEGER DEFAULT 1,
                    guests INTEGER NOT NULL,
                    price_per_night FLOAT NOT NULL,
                    subtotal FLOAT NOT NULL,
                    FOREIGN KEY (booking_id) REFERENCES booking(id),
                    FOREIGN KEY (room_id) REFERENCES room(id)
                )
            """)
            conn.commit()
            print("✓ BookingItem table created/verified!")
            
            # Update all existing rooms to have total_rooms = 5 if NULL
            cursor.execute("UPDATE room SET total_rooms = 5 WHERE total_rooms IS NULL")
            conn.commit()
            print("✓ Updated existing rooms with default total_rooms = 5")
            
            # Show room inventory
            cursor.execute("SELECT name, type, total_rooms FROM room")
            rooms = cursor.fetchall()
            print("\n📊 Current Room Inventory:")
            print("-" * 60)
            for room in rooms:
                print(f"  {room[0]} ({room[1]}): {room[2]} units available")
            print("-" * 60)
            
            conn.close()
            print("\n✅ Database updated successfully!")
            print("\n💡 Tips:")
            print("  - Each room type now has 5 units by default")
            print("  - You can change this in the admin panel")
            print("  - Users can now book multiple rooms of the same type")
            
        except Exception as e:
            print(f"❌ Error updating database: {str(e)}")
            conn.rollback()
            conn.close()
            raise

if __name__ == '__main__':
    update_database()