import os
class Config:
    SECRET_KEY = os.getenv("SECRET_KEY", "dev-secret")
    SQLITE_PATH = os.getenv("SQLITE_PATH", "databse.db")
