from extensions import db

class User(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    username = db.Column(db.String(50), unique=True, nullable=False)
    password_hash = db.Column(db.String(255), nullable=False)
    xp = db.Column(db.Integer, default=0)
    streak = db.Column(db.Integer, default=0)
    role = db.Column(db.String(50), nullable=True) 
    level = db.Column(db.String(50), nullable=True)
    joined_at = db.Column(db.DateTime, default=db.func.current_timestamp())

class UserCourseProgress(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey('user.id'), nullable=False)
    course_id = db.Column(db.Integer, db.ForeignKey('course.id'), nullable=False)
    time_spent = db.Column(db.Integer, default=0) # Total minutes spent
    completed_lessons = db.Column(db.Integer, default=0) # Count of completed lessons
    last_accessed = db.Column(db.DateTime, default=db.func.current_timestamp())
    
    # Relationships
    course = db.relationship('Course', backref='progress')
    user = db.relationship('User', backref='progress')

class Course(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    title = db.Column(db.String(100), nullable=False)
    description = db.Column(db.String(255))
    icon = db.Column(db.String(50))
    tags = db.Column(db.String(100), nullable=True)
    lessons = db.relationship('Lesson', backref='course', lazy=True)

class Lesson(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    course_id = db.Column(db.Integer, db.ForeignKey('course.id'), nullable=False)
    title = db.Column(db.String(100), nullable=False)
    order = db.Column(db.Integer)
    interactions = db.relationship('Interaction', backref='lesson', lazy=True)

class Interaction(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    lesson_id = db.Column(db.Integer, db.ForeignKey('lesson.id'), nullable=False)
    order = db.Column(db.Integer)
    type = db.Column(db.String(50), nullable=False)
    content_json = db.Column(db.Text, nullable=False)
    logic_json = db.Column(db.Text, nullable=True)

class ForumPost(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey('user.id'), nullable=False)
    title = db.Column(db.String(200), nullable=False)
    content = db.Column(db.Text, nullable=False)
    created_at = db.Column(db.DateTime, default=db.func.current_timestamp())
    
    # Relationships
    author = db.relationship('User', backref='posts')
    comments = db.relationship('ForumComment', backref='post', cascade="all, delete-orphan", lazy=True)
    reactions = db.relationship('PostReaction', backref='post', cascade="all, delete-orphan", lazy=True)

class ForumComment(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    post_id = db.Column(db.Integer, db.ForeignKey('forum_post.id'), nullable=False)
    user_id = db.Column(db.Integer, db.ForeignKey('user.id'), nullable=False)
    content = db.Column(db.Text, nullable=False)
    created_at = db.Column(db.DateTime, default=db.func.current_timestamp())
    
    # Relationships
    author = db.relationship('User', backref='comments')

class PostReaction(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey('user.id'), nullable=False)
    post_id = db.Column(db.Integer, db.ForeignKey('forum_post.id'), nullable=False)
    reaction_type = db.Column(db.String(20), default='like') # like, love, haha, etc.
