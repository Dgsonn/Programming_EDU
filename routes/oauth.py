import os

from flask import Blueprint, redirect, session, url_for, current_app
from flask_dance.contrib.facebook import facebook, make_facebook_blueprint
from flask_dance.contrib.google import google, make_google_blueprint

from db import get_db

google_bp = make_google_blueprint(
    client_id=os.environ.get("GOOGLE_CLIENT_ID"),
    client_secret=os.environ.get("GOOGLE_CLIENT_SECRET"),
    scope=["openid",
        "https://www.googleapis.com/auth/userinfo.email",
           "https://www.googleapis.com/auth/userinfo.profile"],
    redirect_url="/auth/google/callback",
  )
  
facebook_bp = make_facebook_blueprint(
    scope=["email", "public_profile"],
    redirect_url="/auth/facebook/callback",
)

_oauth_callback = Blueprint('oauth_callback', __name__)


def _login_or_create(provider: str, provider_id: str, email: str | None, name: str | None):
    """Đăng nhập hoặc tạo user OAuth. Trả về (user_id, error_code)."""
    conn = get_db()
    try:
        # 1. Đã có tài khoản OAuth này
        row = conn.execute(
            'SELECT id FROM users WHERE oauth_provider = %s AND oauth_provider_id = %s',
            (provider, provider_id)
        ).fetchone()
        if row:
            return row['id'], None

        # 2. Email trùng với tài khoản đăng ký thường → tự động liên kết OAuth
        if email:
            existing = conn.execute(
                'SELECT id, oauth_provider FROM users WHERE email = %s',
                (email,)
            ).fetchone()
            if existing and existing['oauth_provider'] is None:
                conn.execute(
                    'UPDATE users SET oauth_provider=%s, oauth_provider_id=%s WHERE id=%s',
                    (provider, provider_id, existing['id'])
                )
                conn.commit()
                return existing['id'], None

        # 3. Tạo user mới
        cur = conn.execute(
            'INSERT INTO users (name, email, oauth_provider, oauth_provider_id) '
            'VALUES (%s, %s, %s, %s) RETURNING id',
            (name or 'Người dùng', email, provider, provider_id)
        )
        conn.commit()
        new_id = cur.fetchone()['id']
        return new_id, None
    finally:
        conn.close()


@_oauth_callback.route('/auth/google/callback')
def google_callback():
    if not google.authorized:
        return redirect(url_for('google.login'))

    resp = google.get('/oauth2/v2/userinfo')
    if not resp.ok:
        return redirect('/login?error=google_failed')

    info = resp.json()
    user_id, err = _login_or_create(
        provider='google',
        provider_id=str(info['id']),
        email=info.get('email'),
        name=info.get('name'),
    )
    if err:
        return redirect(f'/login?error={err}')

    session['user_id'] = user_id
    session.permanent = True
    return redirect('/dashboard')


@_oauth_callback.route('/auth/facebook/callback')
def facebook_callback():
    if not facebook.authorized:
        return redirect(url_for('facebook.login'))

    resp = facebook.get('/me?fields=id,name,email')
    if not resp.ok:
        return redirect('/login?error=facebook_failed')

    info = resp.json()
    user_id, err = _login_or_create(
        provider='facebook',
        provider_id=str(info['id']),
        email=info.get('email'),
        name=info.get('name'),
    )
    if err:
        return redirect(f'/login?error={err}')

    session['user_id'] = user_id
    session.permanent = True
    return redirect('/')
