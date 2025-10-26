
import os
import bcrypt
from datetime import datetime, timedelta
from typing import Optional
from jose import JWTError, jwt
from fastapi import Depends, HTTPException, status
from fastapi.security import OAuth2PasswordBearer
from sqlalchemy.orm import Session

# Local imports. This file depends on crud, schemas, and database.
# This does NOT create a circular import because crud.py does NOT import auth.py.
from . import crud, schemas, database

# --- Configuration ---
# In a real production app, this key should be a secret stored in an environment variable.
SECRET_KEY = os.getenv("SECRET_KEY")
if not SECRET_KEY:
    raise ValueError(" No SECRET_KEY set in environment")

ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_MINUTES = 30

# --- OAuth2 Scheme ---
# This tells FastAPI where the client should go to get a token.
oauth2_scheme = OAuth2PasswordBearer(tokenUrl="token")


# --- Password Utility Functions using BCRYPT ---

def get_password_hash(password: str) -> str:
    """Hashes a new password for storage."""
    # Bcrypt works with bytes, so we encode the password.
    # We truncate to 72 bytes to prevent bcrypt's ValueError.
    password_bytes = password.encode('utf-8')[:72]
    salt = bcrypt.gensalt()
    hashed_bytes = bcrypt.hashpw(password_bytes, salt)
    # The final hash must be stored as a string.
    return hashed_bytes.decode('utf-8')

def verify_password(plain_password: str, hashed_password: str) -> bool:
    """Verifies a plain password against a stored hash."""
    # We must encode both the plain password and the stored hash into bytes.
    # We also truncate the plain password to match how it was hashed.
    password_bytes = plain_password.encode('utf-8')[:72]
    hashed_password_bytes = hashed_password.encode('utf-8')
    # bcrypt.checkpw returns True if they match, False otherwise.
    return bcrypt.checkpw(password_bytes, hashed_password_bytes)


# --- JWT Token Function ---

def create_access_token(data: dict, expires_delta: Optional[timedelta] = None):
    """Creates a new JWT access token."""
    to_encode = data.copy()
    if expires_delta:
        expire = datetime.utcnow() + expires_delta
    else:
        expire = datetime.utcnow() + timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    to_encode.update({"exp": expire})
    encoded_jwt = jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)
    return encoded_jwt


# --- User Authentication Function (for the /token endpoint) ---

def authenticate_user(db: Session, email: str, password: str):
    """
    Checks if a user exists and if the provided password is correct.
    This is used only by the login endpoint.
    """
    user = crud.get_user_by_email(db, email=email)
    # Check if user exists AND if the password is correct.
    if not user or not verify_password(password, user.hashed_password):
        return None  # Return None on failure
    return user


# --- Dependencies for Protected Routes ---

def get_current_user(token: str = Depends(oauth2_scheme), db: Session = Depends(database.SessionLocal)):
    """
    Decodes the JWT token from the request, validates it, and returns the user.
    This is the base dependency for all protected endpoints.
    """
    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Could not validate credentials",
        headers={"WWW-Authenticate": "Bearer"},
    )
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        email: str = payload.get("sub")
        if email is None:
            raise credentials_exception
    except JWTError:
        raise credentials_exception
    
    user = crud.get_user_by_email(db, email=email)
    if user is None:
        raise credentials_exception
    return user

def get_current_active_user(current_user: schemas.User = Depends(get_current_user)):
    """
    A dependency that takes the result of get_current_user and adds a
    check to ensure the user is marked as 'active'.
    """
    if not current_user.is_active:
        raise HTTPException(status_code=400, detail="Inactive user")
    return current_user