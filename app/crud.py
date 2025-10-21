from sqlalchemy.orm import Session, selectinload
from . import models, schemas

def get_user_by_email(db: Session, email: str):
    return db.query(models.User).filter(models.User.email == email).first()

def create_user(db: Session, user: schemas.UserCreate, hashed_password: str):
    db_user = models.User(email=user.email, hashed_password=hashed_password)
    db.add(db_user)
    db.commit()
    db.refresh(db_user)
    return db_user

def get_lists_by_user(db: Session, user_id: int):
    return db.query(models.List).options(selectinload(models.List.tasks)).filter(models.List.owner_id == user_id).all()