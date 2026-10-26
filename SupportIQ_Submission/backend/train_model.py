
from pathlib import Path
import joblib

from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.linear_model import LogisticRegression
from sklearn.pipeline import Pipeline
from sklearn.model_selection import train_test_split
from sklearn.metrics import classification_report

# Example training dataset.
# This is a starter dataset, not a production dataset.
examples = [
    ("I was charged twice for my payment", "Payment"),
    ("Please refund my money", "Payment"),
    ("My transaction is still pending", "Payment"),
    ("My credit card payment failed", "Payment"),
    ("I cannot log into my account", "Account / Login"),
    ("I forgot my password", "Account / Login"),
    ("My account is locked", "Account / Login"),
    ("Help me reset my login password", "Account / Login"),
    ("My package has not arrived", "Delivery / Order"),
    ("Where is my order", "Delivery / Order"),
    ("My shipment is delayed", "Delivery / Order"),
    ("The delivery status is incorrect", "Delivery / Order"),
    ("The app keeps crashing", "Technical Issue"),
    ("I found a bug on the website", "Technical Issue"),
    ("The application shows an error", "Technical Issue"),
    ("The website is not working", "Technical Issue"),
    ("I want to cancel my subscription", "Subscription"),
    ("Please change my membership plan", "Subscription"),
    ("How do I renew my subscription", "Subscription"),
    ("I need help with my current plan", "Subscription"),
    ("I have a question about your service", "General Support"),
    ("Please help me understand this feature", "General Support"),
    ("I need assistance with my account settings", "General Support"),
    ("Can someone help me with a general query", "General Support"),
]

X = [text for text, label in examples]
y = [label for text, label in examples]

# Hold out a test set so we can evaluate the model.
X_train, X_test, y_train, y_test = train_test_split(
    X,
    y,
    test_size=0.25,
    random_state=42,
    stratify=y,
)

model = Pipeline([
    ("tfidf", TfidfVectorizer(ngram_range=(1, 2))),
    ("classifier", LogisticRegression(max_iter=1000)),
])

model.fit(X_train, y_train)

predictions = model.predict(X_test)
print("Evaluation on held-out sample examples:")
print(classification_report(y_test, predictions, zero_division=0))

output_path = Path(__file__).parent / "ticket_category_model.joblib"
joblib.dump(model, output_path)

print(f"Model saved to: {output_path}")

# Quick sanity checks on new example text.
for issue in [
    "I was charged twice and need a refund",
    "My account password does not work",
    "My delivery is late",
]:
    probabilities = model.predict_proba([issue])[0]
    best_index = probabilities.argmax()

    print({
        "issue": issue,
        "predicted_category": model.classes_[best_index],
        "model_probability": round(float(probabilities[best_index]), 3),
    })
