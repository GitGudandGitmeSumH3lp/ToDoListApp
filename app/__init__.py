# In ToDoListApp/app/__init__.py
import os
from flask import Flask, request, jsonify
from flask_sqlalchemy import SQLAlchemy
from flask_cors import CORS
from jose import jwt, JWTError
from functools import wraps
from datetime import datetime, timedelta
import bcrypt

db = SQLAlchemy()
# We define the algorithm globally
ALGORITHM = "HS256"

# --- DATA MODELS (Correct and Final) ---
class User(db.Model):
    __tablename__ = "users"
    id = db.Column(db.Integer, primary_key=True)
    email = db.Column(db.String, unique=True, nullable=False)
    hashed_password = db.Column(db.String, nullable=False)
    # is_active field is removed for simplicity, can be added back later
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
    content = db.Column(db.Text, nullable=True)
    status = db.Column(db.String, default="TO DO", nullable=False)
    owner_id = db.Column(db.Integer, db.ForeignKey('users.id'), nullable=False)
    owner = db.relationship('User', back_populates='notes')
    notebook_id = db.Column(db.Integer, db.ForeignKey('notebooks.id'), nullable=True)
    notebook = db.relationship('Notebook', back_populates='notes')


# --- APP FACTORY (The main Flask application) ---
def create_app():
    app = Flask(__name__)
    # --- THIS IS THE SINGLE SOURCE OF TRUTH FOR YOUR SECRET KEY ---
    # It is now defined inside the app factory.
    app.config['SECRET_KEY'] = "a-very-secret-key-that-will-now-finally-work"
    
    CORS(app, supports_credentials=True, origins=["http://localhost:3000", "http://localhost:3001"])
    basedir = os.path.abspath(os.path.dirname(__file__))
    app.config['SQLALCHEMY_DATABASE_URI'] = 'sqlite:///' + os.path.join(basedir, '../sql_app.db')
    app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False
    db.init_app(app)

    # --- AUTHENTICATION DECORATOR (The "Unlock" function) ---
    def token_required(f):
        @wraps(f)
        def decorated(*args, **kwargs):
            auth_header = request.headers.get('Authorization')
            if not auth_header or not auth_header.startswith('Bearer '):
                return jsonify({'message': 'Token is missing or invalid format!'}), 401
            
            token = auth_header.split(" ")[1]
            try:
                # It uses the app's config to get the secret key
                data = jwt.decode(token, app.config['SECRET_KEY'], algorithms=[ALGORITHM])
                current_user = User.query.filter_by(email=data['sub']).first()
                if not current_user:
                    return jsonify({'message': 'User not found!'}), 401
            except JWTError as e:
                return jsonify({'message': 'Token is invalid or expired!', 'error': str(e)}), 401
                
            return f(current_user, *args, **kwargs)
        return decorated

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
        
        # This uses the app's config to get the secret key for creating the token
        to_encode = {'sub': user.email, "exp": datetime.utcnow() + timedelta(minutes=30)}
        token = jwt.encode(to_encode, app.config['SECRET_KEY'], algorithm=ALGORITHM)
        return jsonify({'access_token': token, 'token_type': 'bearer'})

    @app.route('/notes/', methods=['GET'])
    @token_required
    def get_all_notes(current_user):
        notes = Note.query.filter_by(owner_id=current_user.id, notebook_id=None).order_by(Note.id.desc()).all()
        return jsonify([{'id': n.id, 'title': n.title, 'content': n.content, 'status': n.status} for n in notes])

    @app.route('/notes/', methods=['POST'])
    @token_required
    def create_note(current_user):
        data = request.get_json()
        new_note = Note(title=data['title'], content=data.get('content'), owner_id=current_user.id, status="TO DO", notebook_id=data.get('notebook_id'))
        db.session.add(new_note)
        db.session.commit()
        return jsonify({'id': new_note.id, 'title': new_note.title, 'content': new_note.content, 'status': new_note.status}), 201

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
        notes = Note.query.filter_by(notebook_id=notebook.id).all()
        return jsonify({'id': notebook.id, 'title': notebook.title, 'notes': [{'id': n.id, 'title': n.title, 'content': n.content, 'status': n.status} for n in notes]})
    
    @app.route('/notes/<int:note_id>', methods=['DELETE'])
    @token_required
    def delete_note(current_user, note_id):
        note = Note.query.filter_by(id=note_id, owner_id=current_user.id).first_or_404()
        db.session.delete(note)
        db.session.commit()
        return jsonify({'message': 'Note deleted'}), 2     

    return app