import pandas as pd # type: ignore
import io
import csv
from reportlab.pdfgen import canvas # type: ignore
from reportlab.lib.pagesizes import letter # type: ignore

def export_csv(data_list):
    output = io.StringIO()
    if not data_list:
        return output.getvalue()
    
    writer = csv.DictWriter(output, fieldnames=data_list[0].keys())
    writer.writeheader()
    writer.writerows(data_list)
    return output.getvalue()

def export_excel(data_list):
    output = io.BytesIO()
    df = pd.DataFrame(data_list)
    df.to_excel(output, index=False)
    return output.getvalue()

def export_pdf(data_list):
    output = io.BytesIO()
    c = canvas.Canvas(output, pagesize=letter)
    width, height = letter
    
    c.drawString(100, height - 50, "Financial Report")
    
    y = height - 80
    for row in data_list:
        row_str = " | ".join([f"{k}: {v}" for k, v in row.items()])
        c.drawString(50, y, row_str)
        y -= 20
        if y < 50:
            c.showPage()
            y = height - 50
            
    c.save()
    return output.getvalue()
