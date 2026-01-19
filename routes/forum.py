from flask import Blueprint, render_template, request, jsonify, session, redirect, url_for
from extensions import db
from models import User, ForumPost, ForumComment, PostReaction

forum_bp = Blueprint('forum', __name__, url_prefix='/forum')

def get_current_user():
    if 'user_id' in session:
        return User.query.get(session['user_id'])
    return None

@forum_bp.route('/')
def index():
    if 'user_id' not in session:
        return redirect(url_for('auth.auth_page'))
    user = get_current_user()
    posts = ForumPost.query.order_by(ForumPost.created_at.desc()).all()
    return render_template('forum.html', user=user, posts=posts)

@forum_bp.route('/create_post', methods=['POST'])
def create_post():
    user = get_current_user()
    if not user:
        return jsonify({'success': False, 'msg': 'Vui lòng đăng nhập'})
    
    data = request.json
    title = data.get('title')
    content = data.get('content')
    
    if not title or not content:
        return jsonify({'success': False, 'msg': 'Thiếu tiêu đề hoặc nội dung'})
        
    new_post = ForumPost(user_id=user.id, title=title, content=content)
    db.session.add(new_post)
    db.session.commit()
    
    return jsonify({'success': True})

@forum_bp.route('/post/<int:post_id>')
def post_detail(post_id):
    if 'user_id' not in session:
        return redirect(url_for('auth.auth_page'))
    user = get_current_user()
    post = ForumPost.query.get_or_404(post_id)
    return render_template('forum_post.html', post=post, user=user)

@forum_bp.route('/post/<int:post_id>/comment', methods=['POST'])
def add_comment(post_id):
    user = get_current_user()
    if not user:
        return jsonify({'success': False, 'msg': 'Vui lòng đăng nhập'})

    data = request.json
    content = data.get('content')
    
    if not content:
        return jsonify({'success': False, 'msg': 'Nội dung trống'})
        
    comment = ForumComment(post_id=post_id, user_id=user.id, content=content)
    db.session.add(comment)
    db.session.commit()
    
    return jsonify({'success': True})

@forum_bp.route('/post/<int:post_id>/react', methods=['POST'])
def react_post(post_id):
    user = get_current_user()
    if not user:
        return jsonify({'success': False, 'msg': 'Vui lòng đăng nhập'})
        
    data = request.json
    reaction_type = data.get('type', 'like')
    
    existing = PostReaction.query.filter_by(user_id=user.id, post_id=post_id).first()
    
    if existing:
        if existing.reaction_type == reaction_type:
            # Toggle off if same reaction (bỏ thả like)
            db.session.delete(existing)
            action = 'removed'
        else:
            # Change reaction (thay đổi icon)
            existing.reaction_type = reaction_type
            action = 'updated'
    else:
        new_reaction = PostReaction(user_id=user.id, post_id=post_id, reaction_type=reaction_type)
        db.session.add(new_reaction)
        action = 'added'
        
    db.session.commit()
    
    # Calculate new counts
    like_count = PostReaction.query.filter_by(post_id=post_id, reaction_type='like').count()
    love_count = PostReaction.query.filter_by(post_id=post_id, reaction_type='love').count()
    
    return jsonify({'success': True, 'action': action, 'counts': {'like': like_count, 'love': love_count}})
