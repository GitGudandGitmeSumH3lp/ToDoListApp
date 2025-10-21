# In ToDoListApp/run.py
from app import create_app

app = create_app()

if __name__ == '__main__':
    # Running on port 8000 to match the frontend's API calls
    app.run(debug=True, port=8000)