from sqlalchemy import Column, Integer, String, Float, ForeignKey, DateTime
from sqlalchemy.orm import relationship
import datetime
from database import Base

class User(Base):
    __tablename__ = "users"

    user_id = Column(Integer, primary_key=True, index=True)
    name = Column(String, index=True)
    email = Column(String, unique=True, index=True)
    mobile_number = Column(String, unique=True, index=True)
    monthly_income = Column(Float, default=0.0)
    budget_rule_id = Column(Integer, ForeignKey("budget_rules.rule_id"), nullable=True)

    budget_rule = relationship("BudgetRule", back_populates="users")
    incomes = relationship("Income", back_populates="user")
    expenses = relationship("Expense", back_populates="user")
    transactions = relationship("Transaction", back_populates="user")
    goals = relationship("Goal", back_populates="user")

class BudgetRule(Base):
    __tablename__ = "budget_rules"

    rule_id = Column(Integer, primary_key=True, index=True)
    rule_name = Column(String, unique=True, index=True)
    needs_percentage = Column(Float)
    wants_percentage = Column(Float)
    savings_percentage = Column(Float)

    users = relationship("User", back_populates="budget_rule")

class Income(Base):
    __tablename__ = "incomes"

    income_id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.user_id"))
    amount = Column(Float)
    source = Column(String)
    payment_mode = Column(String, default="Bank")
    date = Column(DateTime, default=datetime.datetime.utcnow)

    user = relationship("User", back_populates="incomes")

class Expense(Base):
    __tablename__ = "expenses"

    expense_id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.user_id"))
    amount = Column(Float)
    category = Column(String)
    payment_mode = Column(String)
    date = Column(DateTime, default=datetime.datetime.utcnow)
    note = Column(String, nullable=True)

    user = relationship("User", back_populates="expenses")

class Transaction(Base):
    __tablename__ = "transactions"

    transaction_id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.user_id"))
    amount = Column(Float)
    transaction_app = Column(String)
    transaction_type = Column(String)  # e.g., 'credit' or 'debit'
    date = Column(DateTime, default=datetime.datetime.utcnow)

    user = relationship("User", back_populates="transactions")

class Goal(Base):
    __tablename__ = "goals"

    goal_id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.user_id"))
    goal_name = Column(String)
    target_amount = Column(Float)
    saved_amount = Column(Float, default=0.0)
    deadline = Column(DateTime)

    user = relationship("User", back_populates="goals")
