import sys
import os
sys.path.insert(0, os.path.abspath('backend'))

from fastapi.testclient import TestClient # type: ignore
from main import app # type: ignore
from database import Base, engine # type: ignore
import models # type: ignore

# Ensure DB is created
Base.metadata.create_all(bind=engine)

client = TestClient(app)

def run_tests():
    print("Starting tests...")
    
    # 1. Create Profile
    r = client.post("/profile/create", json={"name": "Test User", "email": "test@test.com", "mobile_number": "1234567890"})
    if r.status_code != 200:
        print("Create Profile failed", r.text)
        return
    user_id = r.json()["data"]["user_id"]
    print(f"Created user: {user_id}")

    # 2. Add Income
    r = client.post(f"/income/add?user_id={user_id}", json={"source": "Salary", "amount": 5000.0})
    if r.status_code != 200: print("Add income failed", r.text)

    # 3. Add Expense
    r = client.post(f"/expense/add?user_id={user_id}", json={"category": "Food", "amount": 200.0, "payment_mode": "Cash"})
    if r.status_code != 200: print("Add expense failed", r.text)


    # 4. Get Summary
    r = client.get(f"/summary?user_id={user_id}")
    if r.status_code != 200: print("Get summary failed", r.text)
    print("Summary:", r.json())

    # 5. Export Test
    r = client.get(f"/export/pdf?user_id={user_id}")
    if r.status_code != 200: print("Export PDF failed", r.status_code, r.text)
    else: print("PDF export OK")

    r = client.get(f"/export/excel?user_id={user_id}")
    if r.status_code != 200: print("Export Excel failed", r.status_code, r.text)
    else: print("Excel export OK")

    r = client.get(f"/export/csv?user_id={user_id}")
    if r.status_code != 200: print("Export CSV failed", r.status_code, r.text)
    else: print("CSV export OK")

    # 6. Budget
    r = client.get("/budget-rules")
    if r.status_code != 200: print("Budget rules failed", r.text)

    print("ALL TESTS COMPLETED!")

if __name__ == "__main__":
    run_tests()
