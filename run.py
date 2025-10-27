import os
from app import create_app


if "SECRET_KEY" not in os.environ:
    os.environ["SECRET_KEY"] = "your-final-secret-key-that-will-work"
app = create_app()

if __name__ == '__main__':
    app.run(debug=True, port=8000)