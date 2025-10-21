from pydantic import BaseModel
from typing import List as PyList, Optional

class Task(BaseModel):
    id: int
    title: str
    description: Optional[str] = None
    priority: int
    class Config:
        from_attributes = True

class List(BaseModel):
    id: int
    title: str
    tasks: PyList[Task] = []
    class Config:
        from_attributes = True

class User(BaseModel):
    id: int
    email: str
    lists: PyList[List] = []
    class Config:
        from_attributes = True

class TaskCreate(BaseModel):
    title: str

class ListCreate(BaseModel):
    title: str

class UserCreate(BaseModel):
    email: str
    password: str

class Token(BaseModel):
    access_token: str
    token_type: str

class TokenData(BaseModel):
    email: Optional[str] = None

class ListSimple(BaseModel):
    id: int
    title: str

    class Config:
        from_attributes = True