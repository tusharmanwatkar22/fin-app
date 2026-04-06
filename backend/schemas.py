from pydantic import BaseModel
from typing import Optional, List
from datetime import datetime

class BudgetRuleBase(BaseModel):
    rule_name: str
    needs_percentage: float
    wants_percentage: float
    savings_percentage: float

class BudgetRuleCreate(BudgetRuleBase):
    pass

class BudgetRuleResponse(BudgetRuleBase):
    rule_id: int

    class Config:
        from_attributes = True

class UserBase(BaseModel):
    name: str
    email: str
    mobile_number: str
    monthly_income: Optional[float] = 0.0
    budget_rule_id: Optional[int] = None

class UserCreate(UserBase):
    pass

class UserUpdate(BaseModel):
    name: Optional[str] = None
    email: Optional[str] = None
    mobile_number: Optional[str] = None
    monthly_income: Optional[float] = None
    budget_rule_id: Optional[int] = None

class UserResponse(UserBase):
    user_id: int

    class Config:
        from_attributes = True

class IncomeBase(BaseModel):
    amount: float
    source: str
    payment_mode: Optional[str] = "Bank"

class IncomeCreate(IncomeBase):
    pass

class IncomeResponse(IncomeBase):
    income_id: int
    user_id: int
    date: datetime

    class Config:
        from_attributes = True

class ExpenseBase(BaseModel):
    amount: float
    category: str
    payment_mode: str
    note: Optional[str] = None

class ExpenseCreate(ExpenseBase):
    pass

class ExpenseResponse(ExpenseBase):
    expense_id: int
    user_id: int
    date: datetime

    class Config:
        from_attributes = True

class TransactionBase(BaseModel):
    amount: float
    transaction_app: str
    transaction_type: str

class TransactionCreate(TransactionBase):
    pass

class TransactionResponse(TransactionBase):
    transaction_id: int
    user_id: int
    date: datetime

    class Config:
        from_attributes = True

class GoalBase(BaseModel):
    goal_name: str
    target_amount: float
    deadline: datetime

class GoalCreate(GoalBase):
    pass

class GoalResponse(GoalBase):
    goal_id: int
    user_id: int
    saved_amount: float

    class Config:
        from_attributes = True
