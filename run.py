import os
from app import create_app

# This ensures a default SECRET_KEY is set for local development if it's not in the environment.
if "SECRET_KEY" not in os.environ:
    os.environ["SECRET_KEY"] = "this-is-a-safe-default-key-for-local-development-only"

app = create_app()

if __name__ == '__main__':
    app.run(debug=True, port=8000)