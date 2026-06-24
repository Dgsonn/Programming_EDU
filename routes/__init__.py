from routes.main          import main_bp
from routes.auth          import auth_bp
from routes.user          import user_bp
from routes.courses       import courses_bp
from routes.stats         import stats_bp
from routes.notifications import notif_bp
from routes.roadmap       import roadmap_bp
from routes.leaderboard   import leaderboard_bp
from routes.admin         import admin_bp
from routes.oauth         import google_bp, facebook_bp, _oauth_callback


def register_blueprints(app):
    app.register_blueprint(main_bp)
    app.register_blueprint(auth_bp)
    app.register_blueprint(user_bp)
    app.register_blueprint(courses_bp)
    app.register_blueprint(stats_bp)
    app.register_blueprint(notif_bp)
    app.register_blueprint(roadmap_bp)
    app.register_blueprint(leaderboard_bp)
    app.register_blueprint(admin_bp)
    app.register_blueprint(google_bp,   url_prefix='/auth')
    app.register_blueprint(facebook_bp, url_prefix='/auth')
    app.register_blueprint(_oauth_callback)
