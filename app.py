from flask import Flask
from extensions import db
from config import Config
from utils import seed_data

def create_app():
    # 1. Khởi tạo Flask
    app = Flask(__name__)
    
    # 2. Nạp cấu hình từ file config.py
    app.config.from_object(Config)

    # 3. Gắn Database vào App
    db.init_app(app)

    # 4. Đăng ký các Route (Blueprint)
    from routes.auth import auth_bp
    from routes.main import main_bp
    from routes.admin import admin_bp
    
    # --- SỬA Ở ĐÂY ---
    # Gọi đúng tên file bạn vừa đặt là api_routes
    from routes.api_routes import api_bp 
    from routes.forum import forum_bp
    from routes.profile import profile_bp

    app.register_blueprint(auth_bp)
    app.register_blueprint(main_bp)
    app.register_blueprint(admin_bp)
    app.register_blueprint(api_bp)
    app.register_blueprint(forum_bp)
    app.register_blueprint(profile_bp)



    return app

# Tạo ứng dụng
app = create_app()

if __name__ == '__main__':
    # Tạo dữ liệu mẫu nếu chưa có
    with app.app_context():
        seed_data()
    
    print("\n" + "="*50)
    print("✅  SYSTEM STARTED (MODULAR STRUCTURE)")
    print("="*50)
    print("🚀  App URL:     http://127.0.0.1:5000")
    print("👤  Admin Panel: http://127.0.0.1:5000/admin/login")
    print("🔑  Tk/Mk:       admin / admin")
    print("🔑  Tk/Mk:       testuser / user123")
    print("="*50 + "\n")
    
    app.run(debug=True)
