from flask import Blueprint, request, jsonify

api_bp = Blueprint('api', __name__, url_prefix='/api')

@api_bp.route('/lesson', methods=['POST'])
def get_lesson_content():
    topic = request.json.get('topic', 'General')
    return jsonify({
        "title": f"Bài học: {topic}",
        "sections": [{"heading": "Giới thiệu", "content": f"Nội dung demo về {topic}..."}]
    })

@api_bp.route('/quiz', methods=['POST'])
def get_quiz_content():
    return jsonify({
        "title": "Kiểm tra nhanh",
        "questions": [{
            "text": "Câu hỏi mẫu?", 
            "options": ["A", "B", "C", "D"], 
            "correctIndex": 0, 
            "explanation": "Giải thích mẫu"
        }]
    })

@api_bp.route('/check', methods=['POST'])
def check_security():
    return jsonify({
        "riskLevel": "SAFE", 
        "score": 95, 
        "summary": "An toàn", 
        "findings": []
    })