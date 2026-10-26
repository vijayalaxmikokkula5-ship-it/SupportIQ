# SupportIQ — AI Support Ticket Intelligence System

## Overview
SupportIQ is a customer support ticket analysis web application built with React, TypeScript, Python, FastAPI, and SQLite.

## Features
- Submit and view customer support tickets.
- Predict ticket categories using a trained machine-learning classifier.
- Analyze intent, priority, and sentiment using rule-based logic.
- Display confidence scores and recommended actions.
- Store ticket records in SQLite.
- Provide a dashboard for ticket monitoring and analysis.

## Technologies Used
- Frontend: React, TypeScript, CSS
- Backend: Python, FastAPI
- Machine Learning: Scikit-learn, TF-IDF, Logistic Regression
- Database: SQLite

## Requirements
- Python
- Node.js and npm

## Run the Backend
Open PowerShell in the project folder and run:

```powershell
cd backend
pip install -r requirements.txt
python -m uvicorn main:app --reload --host 127.0.0.1 --port 8000
```

API documentation: http://127.0.0.1:8000/docs

## Run the Frontend
Open a second terminal:

```powershell
cd frontend
npm install
npm run dev
```

Open the local URL displayed by Vite.

## Database and Model
The backend uses `supportiq.db` to store tickets and `ticket_category_model.joblib` for category prediction. Keep both files in the backend folder.

Note: The category classifier was trained on a small dataset, so its predictions may not always be accurate. Intent, priority, and sentiment analysis use rule-based logic.