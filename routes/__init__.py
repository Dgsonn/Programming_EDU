from routes.main          import main_bp
from routes.auth          import auth_bp
from routes.user          import user_bp
from routes.courses       import courses_bp
from routes.stats         import stats_bp
from routes.notifications import notif_bp


def register_blueprints(app):
    app.register_blueprint(main_bp)
    app.register_blueprint(auth_bp)
    app.register_blueprint(user_bp)
    app.register_blueprint(courses_bp)
    app.register_blueprint(stats_bp)
    app.register_blueprint(notif_bp)
