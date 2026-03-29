from fastapi import APIRouter, Depends, HTTPException, UploadFile, File # type: ignore
from sqlalchemy.orm import Session # type: ignore
from database import get_db # type: ignore
import models, schemas # type: ignore
import os
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
    if not rules:
        default_rules = [
            models.BudgetRule(rule_name="50-30-20", needs_percentage=50, wants_percentage=30, savings_percentage=20),
            models.BudgetRule(rule_name="40-40-20", needs_percentage=40, wants_percentage=40, savings_percentage=20),
            models.BudgetRule(rule_name="70-20-10", needs_percentage=70, wants_percentage=20, savings_percentage=10),
            models.BudgetRule(rule_name="60-20-20", needs_percentage=60, wants_percentage=20, savings_percentage=20),
            models.BudgetRule(rule_name="60-40", needs_percentage=60, wants_percentage=40, savings_percentage=0),
        ]
        db.bulk_save_objects(default_rules)
        db.commit()
        rules = db.query(models.BudgetRule).all()
    else:
        existing_names = [r.rule_name for r in rules]
        new_rules = []
        if "70-20-10" not in existing_names:
            new_rules.append(models.BudgetRule(rule_name="70-20-10", needs_percentage=70, wants_percentage=20, savings_percentage=10))
        if "60-40" not in existing_names:
            new_rules.append(models.BudgetRule(rule_name="60-40", needs_percentage=60, wants_percentage=40, savings_percentage=0))
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
def route_export_pdf(user_id: int, db: Session = Depends(get_db)):
    expenses = db.query(models.Expense).filter(models.Expense.user_id == user_id).all()
    data_list = [schemas.ExpenseResponse.from_orm(e).dict() for e in expenses]
    pdf_bytes = export_pdf(data_list)
    b64 = base64.b64encode(pdf_bytes).decode('utf-8')
    return success({"filename": "report.pdf", "mime_type": "application/pdf", "data_base64": b64})

@router.get("/export/excel")
def route_export_excel(user_id: int, db: Session = Depends(get_db)):
    expenses = db.query(models.Expense).filter(models.Expense.user_id == user_id).all()
    data_list = [schemas.ExpenseResponse.from_orm(e).dict() for e in expenses]
    excel_bytes = export_excel(data_list)
    b64 = base64.b64encode(excel_bytes).decode('utf-8')
    return success({"filename": "report.xlsx", "mime_type": "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet", "data_base64": b64})

@router.get("/export/csv")
def route_export_csv(user_id: int, db: Session = Depends(get_db)):
    expenses = db.query(models.Expense).filter(models.Expense.user_id == user_id).all()
    data_list = [schemas.ExpenseResponse.from_orm(e).dict() for e in expenses]
    csv_str = export_csv(data_list)
    b64 = base64.b64encode(csv_str.encode('utf-8')).decode('utf-8')
    return success({"filename": "report.csv", "mime_type": "text/csv", "data_base64": b64})
