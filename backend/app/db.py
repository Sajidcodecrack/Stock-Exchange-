import os
from sqlmodel import SQLModel, create_engine, Session

DB_URL = os.getenv("DATABASE_URL", "sqlite:///db.sqlite3")
engine = create_engine(DB_URL, echo=False)

def init_db():
    SQLModel.metadata.create_all(engine)

def get_session():
    with Session(engine) as session:
        yield session
