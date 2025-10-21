from sqlalchemy import Boolean, Column, ForeignKey, Integer, String
from sqlalchemy.orm import relationship
from .database import Base

class User(Base):
    __tablename__ = "users"
    id = Column(Integer, primary_key=True, index=True)
    email = Column(String, unique=True, index=True, nullable=False)
    hashed_password = Column(String, nullable=False)
    is_active = Column(Boolean, default=True)
    lists = relationship("List", back_populates="owner", cascade="all, delete-orphan")

class List(Base):
    __tablename__ = "lists"
    id = Column(Integer, primary_key=True, index=True)
    title = Column(String, index=True, nullable=False)
    owner_id = Column(Integer, ForeignKey("users.id"))
    owner = relationship("User", back_populates="lists")
    tasks = relationship("Task", back_populates="list", cascade="all, delete-orphan")

class Task(Base):
    __tablename__ = "tasks"
    id = Column(Integer, primary_key=True, index=True)
    title = Column(String, index=True, nullable=False)
    description = Column(String, nullable=True)
    priority = Column(Integer, default=1)
    list_id = Column(Integer, ForeignKey("lists.id"))
    list = relationship("List", back_populates="tasks")