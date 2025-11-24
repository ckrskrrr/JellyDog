import os

BASE_DIR = os.path.dirname(os.path.dirname(__file__))

class Config:
    SECRET_KEY = os.getenv("SECRET_KEY", "dev-secret")
    SQLITE_PATH = os.getenv(
        "SQLITE_PATH",
        os.path.join(BASE_DIR, "database.db")
    )
