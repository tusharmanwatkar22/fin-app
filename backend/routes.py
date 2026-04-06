from fastapi import APIRouter, Depends, HTTPException, UploadFile, File # type: ignore
from sqlalchemy.orm import Session # type: ignore
from database import get_db # type: ignore
import models, schemas # type: ignore
import os
import base64
from datetime import datetime
from utils.import_utils import extract_pdf, extract_excel, extract_docx # type: ignore
from utils.export_utils import export_pdf, export_excel, export_csv # type: ignore

router = APIRouter()

def success(data=None):
    if data is None:
        data = {}
    return {"success": True, "data": data}

@router.post("/profile/create")
def create_profile(user: schemas.UserCreate, db: Session = Depends(get_db)):
    db_user = models.User(**user.dict())
    db.add(db_user)
    db.commit()
    db.refresh(db_user)
    return success({"user_id": db_user.user_id})

@router.get("/profile")
def get_profile(user_id: int, db: Session = Depends(get_db)):
    user = db.query(models.User).filter(models.User.user_id == user_id).first()
    if not user:
        return {"success": False, "data": {"error": "User not found"}}
    return success(schemas.UserResponse.from_orm(user).dict())

@router.put("/profile/update")
def update_profile(user_id: int, user_update: schemas.UserUpdate, db: Session = Depends(get_db)):
    user = db.query(models.User).filter(models.User.user_id == user_id).first()
    update_data = user_update.dict(exclude_unset=True)
    update_data = {k: (None if v == "" else v) for k, v in update_data.items()}
    if not user:
        user = models.User(user_id=user_id, **update_data)
        db.add(user)
    else:
        for key, value in update_data.items():
            setattr(user, key, value)
    db.commit()
    return success({"message": "Profile updated"})

@router.post("/income/add")
def add_income(user_id: int, income: schemas.IncomeCreate, db: Session = Depends(get_db)):
    db_income = models.Income(**income.dict(), user_id=user_id)
    db.add(db_income)
    user = db.query(models.User).filter(models.User.user_id == user_id).first()
    if user:
        user.monthly_income = (user.monthly_income or 0) + income.amount
    db.commit()
    return success({"message": "Income added"})

@router.get("/income/list")
def list_income(user_id: int, db: Session = Depends(get_db)):
    incomes = db.query(models.Income).filter(models.Income.user_id == user_id).all()
    return success([schemas.IncomeResponse.from_orm(i).dict() for i in incomes])

@router.post("/expense/add")
def add_expense(user_id: int, expense: schemas.ExpenseCreate, db: Session = Depends(get_db)):
    db_expense = models.Expense(**expense.dict(), user_id=user_id)
    db.add(db_expense)
    db.commit()
    return success({"message": "Expense added"})

@router.get("/expense/list")
def list_expense(user_id: int, db: Session = Depends(get_db)):
    expenses = db.query(models.Expense).filter(models.Expense.user_id == user_id).all()
    return success([schemas.ExpenseResponse.from_orm(e).dict() for e in expenses])

@router.delete("/expense/{expense_id}")
def delete_expense(expense_id: int, db: Session = Depends(get_db)):
    expense = db.query(models.Expense).filter(models.Expense.expense_id == expense_id).first()
    if expense:
        db.delete(expense)
        db.commit()
    return success({"message": "Expense deleted"})

@router.get("/summary")
def get_summary(user_id: int, db: Session = Depends(get_db)):
    user = db.query(models.User).filter(models.User.user_id == user_id).first()
    if not user:
        return {"success": False, "data": {"error": "User not found"}}
    incomes = db.query(models.Income).filter(models.Income.user_id == user_id).all()
    expenses = db.query(models.Expense).filter(models.Expense.user_id == user_id).all()
    goals = db.query(models.Goal).filter(models.Goal.user_id == user_id).all()
    
    total_income = sum(i.amount for i in incomes)
    total_expense = sum(e.amount for e in expenses)
    balance = total_income - total_expense
    
    return success({
        "total_income": total_income,
        "total_expense": total_expense,
        "balance": balance,
        "budget_rule_id": user.budget_rule_id
    })

@router.get("/budget-rules")
def get_budget_rules(db: Session = Depends(get_db)):
    rules = db.query(models.BudgetRule).all()
    expected_rules = [
        {"name": "50-30-20", "n": 50, "w": 30, "s": 20},
        {"name": "40-40-20", "n": 40, "w": 40, "s": 20},
        {"name": "70-20-10", "n": 70, "w": 20, "s": 10},
        {"name": "60-20-20", "n": 60, "w": 20, "s": 20},
        {"name": "60-40", "n": 60, "w": 40, "s": 0},
        {"name": "80-20", "n": 80, "w": 0, "s": 20},
        {"name": "90-10", "n": 90, "w": 0, "s": 10},
        {"name": "70-15-15", "n": 70, "w": 15, "s": 15},
        {"name": "30-30-40", "n": 30, "w": 30, "s": 40}
    ]

    if not rules:
        new_rules = [
            models.BudgetRule(rule_name=r["name"], needs_percentage=r["n"], wants_percentage=r["w"], savings_percentage=r["s"])
            for r in expected_rules
        ]
        db.bulk_save_objects(new_rules)
        db.commit()
        rules = db.query(models.BudgetRule).all()
    else:
        existing_names = [r.rule_name for r in rules]
        new_rules = []
        for r in expected_rules:
            if r["name"] not in existing_names:
                new_rules.append(models.BudgetRule(rule_name=r["name"], needs_percentage=r["n"], wants_percentage=r["w"], savings_percentage=r["s"]))
        if new_rules:
            db.bulk_save_objects(new_rules)
            db.commit()
            rules = db.query(models.BudgetRule).all()
    return success([schemas.BudgetRuleResponse.from_orm(r).dict() for r in rules])

@router.post("/budget/select")
def select_budget_rule(user_id: int, rule_id: int, db: Session = Depends(get_db)):
    user = db.query(models.User).filter(models.User.user_id == user_id).first()
    if user:
        user.budget_rule_id = rule_id
        db.commit()
    return success({"message": "Budget rule selected"})

@router.post("/goals/add")
def add_goal(user_id: int, goal: schemas.GoalCreate, db: Session = Depends(get_db)):
    db_goal = models.Goal(**goal.dict(), user_id=user_id)
    db.add(db_goal)
    db.commit()
    return success({"message": "Goal added"})

@router.get("/goals")
def get_goals(user_id: int, db: Session = Depends(get_db)):
    goals = db.query(models.Goal).filter(models.Goal.user_id == user_id).all()
    return success([schemas.GoalResponse.from_orm(g).dict() for g in goals])

@router.put("/goals/{goal_id}/add-money")
def add_money_to_goal(goal_id: int, amount: float, user_id: int, db: Session = Depends(get_db)):
    goal = db.query(models.Goal).filter(models.Goal.goal_id == goal_id, models.Goal.user_id == user_id).first()
    if not goal:
        return {"success": False, "data": {"error": "Goal not found"}}
    
    goal.saved_amount += amount
    db.commit()
    return success({"message": "Money added to goal successfully", "saved_amount": goal.saved_amount})

@router.post("/transactions/add")
def add_transaction(user_id: int, transaction: schemas.TransactionCreate, db: Session = Depends(get_db)):
    db_txn = models.Transaction(**transaction.dict(), user_id=user_id)
    db.add(db_txn)
    db.commit()
    return success({"message": "Transaction added"})

@router.get("/transactions")
def get_transactions(user_id: int, db: Session = Depends(get_db)):
    txns = db.query(models.Transaction).filter(models.Transaction.user_id == user_id).all()
    return success([schemas.TransactionResponse.from_orm(t).dict() for t in txns])

@router.post("/import/pdf")
async def import_pdf_route(user_id: int, file: UploadFile = File(...), db: Session = Depends(get_db)):
    content = await file.read()
    extract_pdf(content, user_id, db)
    return success({"message": "PDF imported successfully"})

@router.post("/import/excel")
async def import_excel_route(user_id: int, file: UploadFile = File(...), db: Session = Depends(get_db)):
    content = await file.read()
    extract_excel(content, user_id, db)
    return success({"message": "Excel imported successfully"})

@router.post("/import/docx")
async def import_docx_route(user_id: int, file: UploadFile = File(...), db: Session = Depends(get_db)):
    content = await file.read()
    extract_docx(content, user_id, db)
    return success({"message": "Word document imported successfully"})

import base64

@router.get("/export/pdf")
def route_export_pdf(user_id: int, month: int = None, year: int = None, db: Session = Depends(get_db)):
    user = db.query(models.User).filter(models.User.user_id == user_id).first()
    income_query = db.query(models.Income).filter(models.Income.user_id == user_id)
    expense_query = db.query(models.Expense).filter(models.Expense.user_id == user_id)
    
    report_period = "Full History"
    if month and year:
        # Simple string-based date matching for SQLite (YYYY-MM-DD...)
        m_str = f"{year}-{month:02d}-"
        income_query = income_query.filter(models.Income.date.like(f"{m_str}%"))
        expense_query = expense_query.filter(models.Expense.date.like(f"{m_str}%"))
        report_period = datetime(year, month, 1).strftime("%B %Y")
    
    incomes = income_query.all()
    expenses = expense_query.all()
    
    summary = {
        "user_name": user.name if user else "User",
        "total_income": sum(i.amount for i in incomes),
        "total_expense": sum(e.amount for e in expenses),
        "period": report_period
    }
    
    data_list = [
        {"date": i.date, "category": i.source, "amount": i.amount, "type": "Income", "mode": i.payment_mode} for i in incomes
    ] + [
        {"date": e.date, "category": e.category, "amount": e.amount, "type": "Expense", "mode": e.payment_mode} for e in expenses
    ]
    data_list.sort(key=lambda x: x['date'], reverse=True)
    
    pdf_bytes = export_pdf(data_list, summary)
    b64 = base64.b64encode(pdf_bytes).decode('utf-8')
    filename = f"Financial_Report_{report_period.replace(' ', '_')}_{user_id}.pdf"
    return success({"filename": filename, "mime_type": "application/pdf", "data_base64": b64})

@router.get("/export/excel")
def route_export_excel(user_id: int, month: int = None, year: int = None, db: Session = Depends(get_db)):
    user = db.query(models.User).filter(models.User.user_id == user_id).first()
    income_query = db.query(models.Income).filter(models.Income.user_id == user_id)
    expense_query = db.query(models.Expense).filter(models.Expense.user_id == user_id)
    
    report_period = "Full History"
    if month and year:
        m_str = f"{year}-{month:02d}-"
        income_query = income_query.filter(models.Income.date.like(f"{m_str}%"))
        expense_query = expense_query.filter(models.Expense.date.like(f"{m_str}%"))
        report_period = datetime(year, month, 1).strftime("%B %Y")
        
    incomes = income_query.all()
    expenses = expense_query.all()
    
    summary = {
        "user_name": user.name if user else "User",
        "total_income": sum(i.amount for i in incomes),
        "total_expense": sum(e.amount for e in expenses),
        "period": report_period
    }
    
    data_list = [
        {"date": i.date, "category": i.source, "amount": i.amount, "type": "Income", "mode": i.payment_mode} for i in incomes
    ] + [
        {"date": e.date, "category": e.category, "amount": e.amount, "type": "Expense", "mode": e.payment_mode} for e in expenses
    ]
    data_list.sort(key=lambda x: x['date'], reverse=True)
    
    excel_bytes = export_excel(data_list, summary)
    b64 = base64.b64encode(excel_bytes).decode('utf-8')
    filename = f"Financial_Report_{report_period.replace(' ', '_')}_{user_id}.xlsx"
    return success({"filename": filename, "mime_type": "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet", "data_base64": b64})

@router.get("/export/csv")
def route_export_csv(user_id: int, month: int = None, year: int = None, db: Session = Depends(get_db)):
    user = db.query(models.User).filter(models.User.user_id == user_id).first()
    income_query = db.query(models.Income).filter(models.Income.user_id == user_id)
    expense_query = db.query(models.Expense).filter(models.Expense.user_id == user_id)
    
    report_period = "Full History"
    if month and year:
        m_str = f"{year}-{month:02d}-"
        income_query = income_query.filter(models.Income.date.like(f"{m_str}%"))
        expense_query = expense_query.filter(models.Expense.date.like(f"{m_str}%"))
        report_period = datetime(year, month, 1).strftime("%B %Y")
        
    incomes = income_query.all()
    expenses = expense_query.all()
    
    summary = {
        "user_name": user.name if user else "User",
        "total_income": sum(i.amount for i in incomes),
        "total_expense": sum(e.amount for e in expenses),
        "period": report_period
    }
    
    data_list = [
        {"date": i.date, "category": i.source, "amount": i.amount, "type": "Income", "mode": i.payment_mode} for i in incomes
    ] + [
        {"date": e.date, "category": e.category, "amount": e.amount, "type": "Expense", "mode": e.payment_mode} for e in expenses
    ]
    data_list.sort(key=lambda x: x['date'], reverse=True)
    
    csv_str = export_csv(data_list, summary)
    b64 = base64.b64encode(csv_str.encode('utf-8')).decode('utf-8')
    filename = f"Financial_Report_{report_period.replace(' ', '_')}_{user_id}.csv"
    return success({"filename": filename, "mime_type": "text/csv", "data_base64": b64})
