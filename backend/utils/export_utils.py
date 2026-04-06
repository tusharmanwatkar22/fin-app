import pandas as pd # type: ignore
import io
import csv
import base64
from datetime import datetime
import matplotlib # type: ignore
matplotlib.use('Agg') # Non-interactive backend
import matplotlib.pyplot as plt # type: ignore
from reportlab.pdfgen import canvas # type: ignore
from reportlab.lib.pagesizes import letter, A4 # type: ignore
from reportlab.lib import colors # type: ignore
from reportlab.platypus import SimpleDocTemplate, Table, TableStyle, Paragraph, Spacer, Image # type: ignore
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle # type: ignore
from reportlab.lib.units import inch # type: ignore

def generate_pie_chart(data_list):
    # Spending by Category
    df = pd.DataFrame(data_list)
    if df.empty or 'type' not in df.columns or (df['type'] == 'Expense').sum() == 0:
        return None
    
    expenses = df[df['type'] == 'Expense']
    cat_totals = expenses.groupby('category')['amount'].sum()
    
    plt.figure(figsize=(6, 4))
    plt.pie(cat_totals, labels=cat_totals.index, autopct='%1.1f%%', startangle=140, colors=plt.cm.Paired.colors)
    plt.title('Expense Distribution by Category')
    
    img_data = io.BytesIO()
    plt.savefig(img_data, format='png', bbox_inches='tight')
    plt.close()
    img_data.seek(0)
    return img_data

def generate_bar_chart(data_list):
    # Income vs Expense
    df = pd.DataFrame(data_list)
    if df.empty:
        return None
        
    summary = df.groupby('type')['amount'].sum()
    if 'Income' not in summary: summary['Income'] = 0
    if 'Expense' not in summary: summary['Expense'] = 0
    
    plt.figure(figsize=(6, 4))
    summary.plot(kind='bar', color=['#f43f5e', '#10b981'])
    plt.title('Income vs Expenses')
    plt.ylabel('Amount (₹)')
    plt.xticks(rotation=0)
    
    img_data = io.BytesIO()
    plt.savefig(img_data, format='png', bbox_inches='tight')
    plt.close()
    img_data.seek(0)
    return img_data

def export_csv(data_list, summary_data):
    output = io.StringIO()
    writer = csv.writer(output)
    
    # Header Section
    writer.writerow(["FINANCIAL REPORT", datetime.now().strftime("%Y-%m-%d %H:%M")])
    writer.writerow(["User", summary_data.get("user_name", "User")])
    writer.writerow([])
    
    # Summary Section
    writer.writerow(["SUMMARY"])
    writer.writerow(["Total Income", f"₹{summary_data['total_income']:.2f}"])
    writer.writerow(["Total Expense", f"₹{summary_data['total_expense']:.2f}"])
    writer.writerow(["Net Balance", f"₹{(summary_data['total_income'] - summary_data['total_expense']):.2f}"])
    writer.writerow([])
    
    # Data Table
    if data_list:
        writer.writerow(["TRANSACTIONS"])
        headers = ["Date", "Type", "Category", "Mode", "Amount (₹)"]
        writer.writerow(headers)
        for d in data_list:
            writer.writerow([d['date'], d['type'], d['category'], d['mode'], f"{d['amount']:.2f}"])
            
    return output.getvalue()

def export_excel(data_list, summary_data):
    output = io.BytesIO()
    
    with pd.ExcelWriter(output, engine='xlsxwriter') as writer:
        df = pd.DataFrame(data_list)
        
        # Dashboard/Summary Sheet
        summary_df = pd.DataFrame([
            {"Metric": "Total Income", "Value": summary_data['total_income']},
            {"Metric": "Total Expense", "Value": summary_data['total_expense']},
            {"Metric": "Net Balance", "Value": summary_data['total_income'] - summary_data['total_expense']}
        ])
        summary_df.to_excel(writer, sheet_name='Summary', index=False)
        
        workbook = writer.book
        summary_sheet = writer.sheets['Summary']
        
        # Formatting
        header_format = workbook.add_format({'bold': True, 'bg_color': '#D7E4BC', 'border': 1})
        num_format = workbook.add_format({'num_format': '₹#,##0.00'})
        
        summary_sheet.set_column('A:B', 20)
        for col_num, value in enumerate(summary_df.columns.values):
            summary_sheet.write(0, col_num, value, header_format)
            
        # Add a Chart to Summary Sheet
        chart = workbook.add_chart({'type': 'column'})
        chart.add_series({
            'name':       'Financial Overview',
            'categories': '=Summary!$A$2:$A$3',
            'values':     '=Summary!$B$2:$B$3',
            'fill':       {'color': '#10b981'}
        })
        summary_sheet.insert_chart('D2', chart)
        
        # Transactions Sheet
        if not df.empty:
            df.to_excel(writer, sheet_name='Transactions', index=False)
            txn_sheet = writer.sheets['Transactions']
            txn_sheet.set_column('A:E', 15)
            
    return output.getvalue()

def export_pdf(data_list, summary_data):
    output = io.BytesIO()
    doc = SimpleDocTemplate(output, pagesize=A4)
    styles = getSampleStyleSheet()
    elements = []
    
    # Title
    title_style = ParagraphStyle('TitleStyle', parent=styles['Heading1'], alignment=1, spaceAfter=20)
    elements.append(Paragraph("Financial History Report", title_style))
    
    # User Info
    elements.append(Paragraph(f"<b>User:</b> {summary_data.get('user_name', 'User')}", styles['Normal']))
    elements.append(Paragraph(f"<b>Date Generated:</b> {datetime.now().strftime('%Y-%m-%d %H:%M')}", styles['Normal']))
    elements.append(Spacer(1, 0.2 * inch))
    
    # Summary Table
    summary_table_data = [
        ['Total Income', f"₹{summary_data['total_income']:,.2f}"],
        ['Total Expenses', f"₹{summary_data['total_expense']:,.2f}"],
        ['Net Savings', f"₹{(summary_data['total_income'] - summary_data['total_expense']):,.2f}"]
    ]
    st = Table(summary_table_data, colWidths=[2 * inch, 2 * inch])
    st.setStyle(TableStyle([
        ('BACKGROUND', (0, 0), (0, -1), colors.lightgrey),
        ('GRID', (0, 0), (-1, -1), 1, colors.black),
        ('ALIGN', (1, 0), (1, -1), 'RIGHT'),
        ('FONTNAME', (0, 0), (-1, -1), 'Helvetica-Bold'),
        ('BOTTOMPADDING', (0, 0), (-1, -1), 10),
    ]))
    elements.append(st)
    elements.append(Spacer(1, 0.3 * inch))
    
    # Charts Section
    pie_img = generate_pie_chart(data_list)
    bar_img = generate_bar_chart(data_list)
    
    if pie_img or bar_img:
        chart_table_data = []
        row = []
        if pie_img:
            row.append(Image(pie_img, width=2.5 * inch, height=2 * inch))
        if bar_img:
            row.append(Image(bar_img, width=2.5 * inch, height=2 * inch))
        chart_table_data.append(row)
        
        ct = Table(chart_table_data)
        elements.append(ct)
        elements.append(Spacer(1, 0.3 * inch))
    
    # Detailed Transactions Table
    if data_list:
        elements.append(Paragraph("Detailed Transactions", styles['Heading2']))
        table_data = [['Date', 'Type', 'Category', 'Mode', 'Amount']]
        for d in data_list:
            table_data.append([
                d['date'],
                d['type'],
                d['category'],
                d['mode'],
                f"₹{d['amount']:,.2f}"
            ])
            
        dt = Table(table_data, repeatRows=1, colWidths=[1.1*inch, 0.8*inch, 1.5*inch, 1*inch, 1*inch])
        dt.setStyle(TableStyle([
            ('BACKGROUND', (0, 0), (-1, 0), colors.HexColor('#28a745')),
            ('TEXTCOLOR', (0, 0), (-1, 0), colors.whitesmoke),
            ('ALIGN', (0, 0), (-1, -1), 'CENTER'),
            ('ALIGN', (4, 1), (4, -1), 'RIGHT'),
            ('FONTNAME', (0, 0), (-1, 0), 'Helvetica-Bold'),
            ('FONTSIZE', (0, 0), (-1, 0), 12),
            ('BOTTOMPADDING', (0, 0), (-1, 0), 12),
            ('GRID', (0, 0), (-1, -1), 0.5, colors.grey),
            ('ROWBACKGROUNDS', (0, 1), (-1, -1), [colors.white, colors.whitesmoke])
        ]))
        elements.append(dt)
        
    doc.build(elements)
    return output.getvalue()
