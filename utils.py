import json
from werkzeug.security import generate_password_hash
from extensions import db
from models import User, Course, Lesson, Interaction

# Hàm xử lý JSON tương tác
def parse_interaction(interaction):
    return {
        "id": interaction.id,
        "type": interaction.type,
        "content": json.loads(interaction.content_json),
    }

# Hàm kiểm tra đáp án
def validate_answer(interaction, user_answer):
    logic = json.loads(interaction.logic_json)
    if interaction.type == 'multiple_choice':
        return (str(user_answer) == str(logic['correct_index'])), logic['explanation']
    elif interaction.type == 'input_number':
        try:
            return (float(user_answer) == float(logic['correct_value'])), logic['explanation']
        except:
            return False, "Vui lòng nhập số."
    return False, "Lỗi."

# Hàm tạo dữ liệu mẫu (Seed Data)
def seed_data():
    db.create_all()
    
    # Tạo hoặc cập nhật Admin
    admin = User.query.filter_by(username='admin').first()
    if not admin:
        print(">> Đang tạo tài khoản Admin...")
        admin = User(
            username='admin', 
            password_hash=generate_password_hash('admin'), # Pass: admin
            role='admin', 
            level='expert',
            xp=9999
        )
        db.session.add(admin)
    else:
        print(">> Reset mật khẩu Admin về 'admin'...")
        admin.password_hash = generate_password_hash('admin')
    
    db.session.commit()

    # Tạo hoặc cập nhật Test User
    testuser = User.query.filter_by(username='testuser').first()
    if not testuser:
        print(">> Đang tạo tài khoản Test User...")
        testuser = User(
            username='testuser', 
            password_hash=generate_password_hash('user123'), 
            role='user',                 # Role học viên
            level='beginner',            # Level bắt đầu
            xp=50,                       # Cho ít XP mẫu
            streak=1,
            joined_at=db.func.current_timestamp()
        )
        db.session.add(testuser)
    else:
        print(">> Reset mật khẩu Test User về 'user123'...")
        testuser.password_hash = generate_password_hash('user123')

    db.session.commit()

    # Tạo Course mẫu
    if not Course.query.first():
        print(">> Đang tạo khóa học mẫu...")
        c1 = Course(title="Nhập môn Hacker", description="Làm quen với Linux và Mạng.", icon="fa-user-secret", tags="beginner")
        db.session.add(c1)
        db.session.commit()
        l1 = Lesson(course_id=c1.id, title="Bài 1: Mở đầu", order=1)
        db.session.add(l1)
        db.session.commit()
        i1 = Interaction(lesson_id=l1.id, order=1, type="text", content_json=json.dumps({"heading":"Xin chào","body":"Bắt đầu nào!"}))
        db.session.add(i1)
        db.session.commit()