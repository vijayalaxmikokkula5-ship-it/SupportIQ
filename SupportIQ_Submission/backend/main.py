from fastapi import FastAPI, Form
from fastapi.middleware.cors import CORSMiddleware
import sqlite3
from datetime import datetime
from pathlib import Path
import joblib

app = FastAPI(
    title="AI Support Ticket Intelligence System",
    description="Advanced AI-powered customer support ticket analysis platform",
    version="3.0.0"
)


# =========================
# CORS
# =========================

app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:5173",
        "http://localhost:5174",
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# =========================
# DATABASE
# =========================

DATABASE = "supportiq.db"
MODEL_PATH = Path(__file__).parent / "ticket_category_model.joblib"
category_model = joblib.load(MODEL_PATH)

def init_database():
    connection = sqlite3.connect(DATABASE)
    cursor = connection.cursor()

    cursor.execute("""
        CREATE TABLE IF NOT EXISTS tickets (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            name TEXT NOT NULL,
            email TEXT NOT NULL,
            issue TEXT NOT NULL,
            category TEXT NOT NULL,
            intent TEXT NOT NULL,
            priority TEXT NOT NULL,
            sentiment TEXT NOT NULL,
            confidence REAL NOT NULL,
            recommended_action TEXT NOT NULL,
            created_at TEXT NOT NULL
        )
    """)

    connection.commit()
    connection.close()


init_database()


# =========================
# CATEGORY DETECTION
# =========================
def detect_category(issue: str):
    prediction = category_model.predict([issue])[0]
    return str(prediction)
# =========================
# INTENT DETECTION
# =========================

def detect_intent(issue: str):
    text = issue.lower()

    if "twice" in text or "duplicate" in text:
        return "Duplicate Transaction"

    if "refund" in text or "money back" in text:
        return "Refund Request"

    if "pending" in text:
        return "Transaction Pending"

    if "login" in text or "sign in" in text:
        return "Login Problem"

    if "password" in text:
        return "Password Assistance"

    if "delivery" in text or "shipping" in text:
        return "Delivery Problem"

    if "order" in text:
        return "Order Issue"

    if "error" in text or "bug" in text:
        return "Technical Problem"

    if "cancel" in text:
        return "Cancellation Request"

    return "General Assistance"


# =========================
# PRIORITY PREDICTION
# =========================

def detect_priority(issue: str):
    text = issue.lower()

    high_words = [
        "urgent",
        "emergency",
        "blocked",
        "hacked",
        "fraud",
        "security",
        "charged twice",
        "money stolen",
        "payment failed",
        "account locked"
    ]

    medium_words = [
        "pending",
        "delayed",
        "not received",
        "not working",
        "error",
        "refund"
    ]

    if any(word in text for word in high_words):
        return "HIGH"

    if any(word in text for word in medium_words):
        return "MEDIUM"

    return "LOW"


# =========================
# SENTIMENT ANALYSIS
# =========================

def detect_sentiment(issue: str):
    text = issue.lower()

    negative_words = [
        "angry",
        "bad",
        "worst",
        "frustrated",
        "upset",
        "failed",
        "failure",
        "problem",
        "issue",
        "wrong",
        "disappointed",
        "urgent",
        "hate"
    ]

    positive_words = [
        "thank",
        "thanks",
        "good",
        "great",
        "happy",
        "excellent",
        "appreciate"
    ]

    negative_count = sum(word in text for word in negative_words)
    positive_count = sum(word in text for word in positive_words)

    if negative_count > positive_count:
        return "Negative"

    if positive_count > negative_count:
        return "Positive"

    return "Neutral"


# =========================
# CONFIDENCE SCORE
# =========================

def calculate_confidence(issue: str):
    words = len(issue.split())

    if words >= 15:
        return 0.94

    if words >= 8:
        return 0.89

    if words >= 4:
        return 0.82

    return 0.70


# =========================
# SOLUTION RECOMMENDATION
# =========================

def recommend_solution(category: str, intent: str, priority: str):

    if category == "Payment":

        if intent == "Duplicate Transaction":
            return "Verify transaction history and initiate duplicate-payment investigation."

        if intent == "Refund Request":
            return "Check refund eligibility and verify the original transaction."

        return "Verify payment status and transaction records."

    if category == "Account / Login":

        if intent == "Password Assistance":
            return "Guide the customer through secure password reset."

        return "Verify account status and assist with secure account recovery."

    if category == "Delivery / Order":
        return "Check order tracking and provide the latest delivery status."

    if category == "Technical Issue":
        return "Collect error details, reproduce the issue, and escalate if required."

    if category == "Subscription":
        return "Verify subscription status and process the requested plan change."

    return "Review the ticket and provide an appropriate customer support response."


# =========================
# HOME
# =========================

@app.get("/")
def home():
    return {
        "message": "AI Support Ticket Intelligence System API",
        "status": "running",
        "version": "3.0.0"
    }


# =========================
# HEALTH CHECK
# =========================

@app.get("/health")
def health():
    return {
        "status": "healthy"
    }


# =========================
# SUBMIT AND ANALYZE TICKET
# =========================

@app.post("/submit-ticket")
def submit_ticket(
    name: str = Form(...),
    email: str = Form(...),
    issue: str = Form(...)
):

    category = detect_category(issue)
    intent = detect_intent(issue)
    priority = detect_priority(issue)
    sentiment = detect_sentiment(issue)
    confidence = calculate_confidence(issue)

    recommendation = recommend_solution(
        category,
        intent,
        priority
    )

    created_at = datetime.now().strftime(
        "%Y-%m-%d %H:%M:%S"
    )

    connection = sqlite3.connect(DATABASE)
    cursor = connection.cursor()

    cursor.execute("""
        INSERT INTO tickets (
            name,
            email,
            issue,
            category,
            intent,
            priority,
            sentiment,
            confidence,
            recommended_action,
            created_at
        )
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    """, (
        name,
        email,
        issue,
        category,
        intent,
        priority,
        sentiment,
        confidence,
        recommendation,
        created_at
    ))

    ticket_id = cursor.lastrowid

    connection.commit()
    connection.close()

    return {
        "status": "success",
        "message": "Support ticket analyzed and saved successfully",

        "ticket": {
            "id": ticket_id,
            "name": name,
            "email": email,
            "issue": issue,
            "created_at": created_at
        },

        "ai_analysis": {
            "category": category,
            "intent": intent,
            "priority": priority,
            "sentiment": sentiment,
            "confidence": confidence,
            "recommended_action": recommendation
        }
    }


# =========================
# GET ALL TICKETS
# =========================

@app.get("/tickets")
def get_tickets():

    connection = sqlite3.connect(DATABASE)
    connection.row_factory = sqlite3.Row
    cursor = connection.cursor()

    cursor.execute("""
        SELECT *
        FROM tickets
        ORDER BY id DESC
    """)

    tickets = [dict(row) for row in cursor.fetchall()]

    connection.close()

    return {
        "status": "success",
        "count": len(tickets),
        "tickets": tickets
    }

# =========================
# DELETE TICKET
# =========================

@app.delete("/tickets/{ticket_id}")
def delete_ticket(ticket_id: int):
    connection = sqlite3.connect(DATABASE)
    cursor = connection.cursor()

    cursor.execute(
        "SELECT id FROM tickets WHERE id = ?",
        (ticket_id,)
    )

    ticket = cursor.fetchone()

    if ticket is None:
        connection.close()
        from fastapi import HTTPException
        raise HTTPException(
            status_code=404,
            detail="Ticket not found"
        )

    cursor.execute(
        "DELETE FROM tickets WHERE id = ?",
        (ticket_id,)
    )

    connection.commit()
    connection.close()

    return {
        "status": "success",
        "message": "Ticket deleted successfully",
        "ticket_id": ticket_id
    }
