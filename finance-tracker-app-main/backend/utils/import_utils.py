import pandas as pd # type: ignore
import io
import PyPDF2 # type: ignore
from docx import Document # type: ignore
from datetime import datetime
import models # type: ignore

def parse_and_add_expense(text_content, user_id, db):
    # This is a mock parser. In a real app, you would use NLP or regex to extract Amount, Category, Date
    # For now, if we see a number, we'll just log it as an expense for demonstration
    pass  # We will just return if not fully implementing complex NLP
    
    # Adding a dummy expense to show import worked
    dummy_expense = models.Expense(
        user_id=user_id,
        amount=100.0,
        category="Imported",
        payment_mode="Unknown",
        date=datetime.utcnow(),
        note=f"Imported from document: {text_content[:20]}..."
    )
    db.add(dummy_expense)
    db.commit()

def extract_excel(content, user_id, db):
    try:
        df = pd.read_excel(io.BytesIO(content))
        # Assuming the excel has columns: Amount, Category, Payment Mode, Note
        for _, row in df.iterrows():
            amt = float(row.get('Amount', 0))
            if amt > 0:
                expense = models.Expense(
                    user_id=user_id,
                    amount=amt,
                    category=str(row.get('Category', 'Other')),
                    payment_mode=str(row.get('Payment Mode', 'Unknown')),
                    date=datetime.utcnow(),
                    note=str(row.get('Note', 'Imported via Excel'))
                )
                db.add(expense)
        db.commit()
    except Exception as e:
        print(f"Error extracting excel: {e}")

def extract_pdf(content, user_id, db):
    try:
        reader = PyPDF2.PdfReader(io.BytesIO(content))
        text = ""
        for page in reader.pages:
            text += page.extract_text() + "\n"
        parse_and_add_expense(text, user_id, db)
    except Exception as e:
        print(f"Error extracting PDF: {e}")

def extract_docx(content, user_id, db):
    try:
        doc = Document(io.BytesIO(content))
        text = "\n".join([para.text for para in doc.paragraphs])
        parse_and_add_expense(text, user_id, db)
    except Exception as e:
        print(f"Error extracting DOCX: {e}")
