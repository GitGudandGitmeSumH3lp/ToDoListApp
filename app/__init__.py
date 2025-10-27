import os
from flask import Flask, request, jsonify
from flask_sqlalchemy import SQLAlchemy
from flask_cors import CORS
from jose import jwt, JWTError
from functools import wraps
from datetime import datetime, timedelta, timezone
import bcrypt

db = SQLAlchemy()
# Read the secret DIRECTLY from the environment variables.
# Render sets these from its dashboard. Our run.py sets it for local dev.
SECRET_KEY = os.environ.get("SECRET_KEY")
ALGORITHM = "HS256"

# with a clear error in the logs, instead of failing silently later.
if not SECRET_KEY:
    raise ValueError("FATAL ERROR: SECRET_KEY environment variable is not set.")

# --- DATA MODELS ---
class User(db.Model):
    __tablename__ = "users"
    id = db.Column(db.Integer, primary_key=True)
    email = db.Column(db.String, unique=True, nullable=False)
    hashed_password = db.Column(db.String, nullable=False)
    username = db.Column(db.String, unique=True, nullable=True)
    profile_picture_url = db.Column(db.String, nullable=True)
    notebooks = db.relationship('Notebook', back_populates='owner', cascade="all, delete-orphan")
    notes = db.relationship('Note', back_populates='owner', cascade="all, delete-orphan")

class Notebook(db.Model):
    __tablename__ = "notebooks"
    id = db.Column(db.Integer, primary_key=True)
    title = db.Column(db.String, nullable=False)
    owner_id = db.Column(db.Integer, db.ForeignKey('users.id'), nullable=False)
    owner = db.relationship('User', back_populates='notebooks')
    notes = db.relationship('Note', back_populates='notebook', cascade="all, delete-orphan")

class Note(db.Model):
    __tablename__ = "notes"
    id = db.Column(db.Integer, primary_key=True)
    title = db.Column(db.String, nullable=False)
    category = db.Column(db.String, default="Miscellaneous", nullable=True)
    status = db.Column(db.String, default="TO DO", nullable=False)
    priority = db.Column(db.Integer, default=1, nullable=False)
    due_date = db.Column(db.DateTime, nullable=True)
    owner_id = db.Column(db.Integer, db.ForeignKey('users.id'), nullable=False)
    owner = db.relationship('User', back_populates='notes')
    notebook_id = db.Column(db.Integer, db.ForeignKey('notebooks.id'), nullable=True)
    notebook = db.relationship('Notebook', back_populates='notes')

# --- AUTH DECORATOR ---
def token_required(f):
    @wraps(f)
    def decorated(*args, **kwargs):
        auth_header = request.headers.get('Authorization')
        if not auth_header or not auth_header.startswith('Bearer '):
            return jsonify({'message': 'Token is missing or invalid format!'}), 401
        token = auth_header.split(" ")[1]
        try:
            if not SECRET_KEY:
                raise Exception("SECRET_KEY not configured on the server")
            data = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
            current_user = User.query.filter_by(email=data['sub']).first()
            if not current_user:
                return jsonify({'message': 'User not found!'}), 401
        except JWTError as e:
            return jsonify({'message': 'Token is invalid or expired!', 'error': str(e)}), 401
        except Exception as e:
            return jsonify({'message': 'Internal server error during auth', 'error': str(e)}), 500
        return f(current_user, *args, **kwargs)
    return decorated

# --- APP FACTORY ---
def create_app():
    app = Flask(__name__)
    app.config['SECRET_KEY'] = SECRET_KEY
    CORS(app, supports_credentials=True, origins=[
        "http://localhost:3000",
        "http://localhost:3001",
        "https://to-do-list-app-pi-liart.vercel.app"
    ])
    basedir = os.path.abspath(os.path.dirname(__file__))
    app.config['SQLALCHEMY_DATABASE_URI'] = 'sqlite:///' + os.path.join(basedir, '../sql_app.db')
    app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False
    db.init_app(app)

    with app.app_context():
        db.create_all()

    # --- API ENDPOINTS ---
    @app.route('/users/', methods=['POST'])
    def create_user():
        data = request.get_json()
        if not data or not data.get('email') or not data.get('password'): return jsonify({'message': 'Missing data'}), 400
        if User.query.filter_by(email=data['email']).first(): return jsonify({'message': 'Email already registered'}), 400
        password_bytes = data['password'].encode('utf-8')[:72]
        hashed_password = bcrypt.hashpw(password_bytes, bcrypt.gensalt()).decode('utf-8')
        new_user = User(email=data['email'], hashed_password=hashed_password)
        db.session.add(new_user)
        db.session.commit()
        return jsonify({"id": new_user.id, "email": new_user.email}), 201

    @app.route('/token', methods=['POST'])
    def login():
        data = request.form
        user = User.query.filter_by(email=data.get('username')).first()
        if not user or not bcrypt.checkpw(data.get('password').encode('utf-8')[:72], user.hashed_password.encode('utf-8')):
            return jsonify({'message': 'Could not verify'}), 401
        to_encode = {'sub': user.email, "exp": datetime.now(timezone.utc) + timedelta(minutes=30)}
        token = jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)
        return jsonify({'access_token': token, 'token_type': 'bearer'})

    @app.route('/me', methods=['GET'])
    @token_required
    def get_me(current_user):
        return jsonify({'id': current_user.id, 'email': current_user.email, 'username': current_user.username, 'profile_picture_url': current_user.profile_picture_url})

    @app.route('/me', methods=['PUT'])
    @token_required
    def update_me(current_user):
        data = request.get_json()
        new_username = data.get('username')
        if new_username and new_username != current_user.username:
            if User.query.filter_by(username=new_username).first():
                return jsonify({'message': 'Username is already taken'}), 409
            current_user.username = new_username
        db.session.commit()
        return jsonify({'message': 'Profile updated successfully'}), 200

    @app.route('/notes/', methods=['GET'])
    @token_required
    def get_all_notes(current_user):
        notes = Note.query.filter_by(owner_id=current_user.id, notebook_id=None).order_by(Note.priority.desc(), Note.id.desc()).all()
        return jsonify([{'id': n.id, 'title': n.title, 'category': n.category, 'status': n.status, 'priority': n.priority, 'due_date': str(n.due_date) if n.due_date else None} for n in notes])

    @app.route('/notes/', methods=['POST'])
    @token_required
    def create_note(current_user):
        data = request.get_json()
        new_note = Note(title=data['title'], category=data.get('category', 'Miscellaneous'), owner_id=current_user.id, status="TO DO", notebook_id=data.get('notebook_id'), priority=data.get('priority', 1))
        if data.get('due_date'):
            new_note.due_date = datetime.fromisoformat(data['due_date'].replace('Z', ''))
        db.session.add(new_note)
        db.session.commit()
        return jsonify({'id': new_note.id, 'title': new_note.title, 'category': new_note.category, 'status': new_note.status, 'priority': new_note.priority, 'due_date': str(new_note.due_date) if new_note.due_date else None}), 201

    @app.route('/notes/<int:note_id>', methods=['PUT'])
    @token_required
    def update_note(current_user, note_id):
        data = request.get_json()
        note = Note.query.filter_by(id=note_id, owner_id=current_user.id).first_or_404()
        note.title = data.get('title', note.title)
        note.category = data.get('category', note.category)
        note.priority = data.get('priority', note.priority)
        due_date_str = data.get('due_date')
        if 'due_date' in data:
            note.due_date = datetime.fromisoformat(due_date_str.replace('Z', '')) if due_date_str else None
        db.session.commit()
        return jsonify({'message': 'Note updated successfully'}), 200

    @app.route('/notes/<int:note_id>', methods=['DELETE'])
    @token_required
    def delete_note(current_user, note_id):
        note = Note.query.filter_by(id=note_id, owner_id=current_user.id).first_or_404()
        db.session.delete(note)
        db.session.commit()
        return jsonify({'message': 'Note deleted'}), 200

    @app.route('/notes/<int:note_id>/status', methods=['PUT'])
    @token_required
    def update_note_status(current_user, note_id):
        data = request.get_json()
        note = Note.query.filter_by(id=note_id, owner_id=current_user.id).first_or_404()
        note.status = data.get('status')
        db.session.commit()
        return jsonify({'message': 'Status updated'}), 200
        
    @app.route('/notebooks/', methods=['GET'])
    @token_required
    def get_all_notebooks(current_user):
        notebooks = Notebook.query.filter_by(owner_id=current_user.id).order_by(Notebook.title).all()
        return jsonify([{'id': nb.id, 'title': nb.title} for nb in notebooks])

    @app.route('/notebooks/', methods=['POST'])
    @token_required
    def create_notebook(current_user):
        data = request.get_json()
        new_notebook = Notebook(title=data['title'], owner_id=current_user.id)
        db.session.add(new_notebook)
        db.session.commit()
        return jsonify({'id': new_notebook.id, 'title': new_notebook.title}), 201

    @app.route('/notebooks/<int:notebook_id>/', methods=['GET'])
    @token_required
    def get_notebook_details(current_user, notebook_id):
        notebook = Notebook.query.filter_by(id=notebook_id, owner_id=current_user.id).first_or_404()
        notes = Note.query.filter_by(notebook_id=notebook.id).order_by(Note.priority.desc(), Note.id.desc()).all()
        return jsonify({'id': notebook.id, 'title': notebook.title, 'notes': [{'id': n.id, 'title': n.title, 'category': n.category, 'status': n.status, 'priority': n.priority, 'due_date': str(n.due_date) if n.due_date else None} for n in notes]})
        
    return app