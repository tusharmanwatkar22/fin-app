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
    
    plt.figure(figsize=(8, 6))
    plt.pie(cat_totals, labels=cat_totals.index, autopct='%1.1f%%', startangle=140, colors=plt.cm.Paired.colors, textprops={'fontsize': 10})
    plt.title('Expense Distribution by Category', fontsize=14, pad=20)
    
    img_data = io.BytesIO()
    plt.savefig(img_data, format='png', bbox_inches='tight', dpi=150)
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
    plt.ylabel('Amount (Rs.)')
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
    writer.writerow(["FINANCIAL REPORT", summary_data.get("period", "Full History")])
    writer.writerow(["User", summary_data.get("user_name", "User")])
    writer.writerow(["Date Generated", datetime.now().strftime("%Y-%m-%d %H:%M")])
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
        headers = ["Date", "Time", "Type", "Category", "Mode", "Amount (Rs.)"]
        writer.writerow(headers)
        for d in data_list:
            raw_date = str(d.get('date', ""))
            display_date = raw_date[:10] if len(raw_date) >= 10 else raw_date
            display_time = raw_date[11:16] if len(raw_date) >= 16 else ""
            writer.writerow([display_date, display_time, d['type'], d['category'], d['mode'], f"{d['amount']:.2f}"])
            
    return output.getvalue()

def export_excel(data_list, summary_data):
    output = io.BytesIO()
    
    with pd.ExcelWriter(output, engine='xlsxwriter') as writer:
        # Prepare DataFrame
        df = pd.DataFrame(data_list)
        if not df.empty and 'date' in df.columns:
            # Convert to string to avoid datetime slicing issues
            df['date'] = df['date'].astype(str)
            # Insert Time column after Date
            df.insert(1, 'Time', df['date'].str.slice(11, 16))
            df['date'] = df['date'].str.slice(0, 10)
            df.rename(columns={'date': 'Date'}, inplace=True)
            # Reorder for better layout: Date, Time, Type, Category, Mode, Amount
            cols = ['Date', 'Time', 'type', 'category', 'mode', 'amount']
            # Only use columns that exist
            cols = [c for c in cols if c in df.columns]
            df = df[cols]
        
        # Dashboard/Summary Sheet
        summary_df = pd.DataFrame([
            {"Metric": "Report Period", "Value": summary_data.get("period", "Full History")},
            {"Metric": "User Name", "Value": summary_data.get("user_name", "User")},
            {"Metric": "Total Income", "Value": summary_data['total_income']},
            {"Metric": "Total Expense", "Value": summary_data['total_expense']},
            {"Metric": "Net Balance", "Value": summary_data['total_income'] - summary_data['total_expense']}
        ])
        summary_df.to_excel(writer, sheet_name='Summary', index=False)
        
        workbook = writer.book
        summary_sheet = writer.sheets['Summary']
        
        # Formats
        header_format = workbook.add_format({
            'bold': True, 
            'bg_color': '#28a745', # Professional Green
            'font_color': 'white',
            'align': 'center', 
            'valign': 'vcenter', 
            'border': 1
        })
        center_format = workbook.add_format({
            'align': 'center', 
            'valign': 'vcenter', 
            'border': 1
        })
        num_format = workbook.add_format({
            'num_format': '₹#,##0.00',
            'align': 'center', 
            'valign': 'vcenter', 
            'border': 1
        })
        
        # Formatting Summary Sheet
        summary_sheet.set_column('A:B', 30, center_format)
        for col_num, value in enumerate(summary_df.columns.values):
            summary_sheet.write(0, col_num, value, header_format)
            
        # Add a Column Chart to Summary Sheet (Income vs Expense)
        chart = workbook.add_chart({'type': 'column'})
        chart.add_series({
            'name':       'Financial Overview',
            'categories': '=Summary!$A$4:$A$5',
            'values':     '=Summary!$B$4:$B$5',
            'fill':       {'color': '#10b981'}
        })
        summary_sheet.insert_chart('D2', chart)

        # Add a Pie Chart to Summary Sheet (Expense Categories)
        if not df.empty and 'Expense' in df['type'].values:
            expenses_df = df[df['type'] == 'Expense']
            cat_totals = expenses_df.groupby('category')['amount'].sum().reset_index()
            
            # Write cat totals to a hidden area or new sheet for the chart
            # Adding headers for clarity
            start_row = 15
            summary_sheet.write(start_row - 1, 0, 'Category', header_format)
            summary_sheet.write(start_row - 1, 1, 'Total Amount', header_format)
            
            for i, row in cat_totals.iterrows():
                summary_sheet.write(start_row + i, 0, row['category'])
                summary_sheet.write(start_row + i, 1, row['amount'], num_format)
            
            pie_chart = workbook.add_chart({'type': 'pie'})
            pie_chart.add_series({
                'name': 'Expense Distribution',
                'categories': ['Summary', start_row, 0, start_row + len(cat_totals) - 1, 0],
                'values':     ['Summary', start_row, 1, start_row + len(cat_totals) - 1, 1],
                'data_labels': {'percentage': True, 'category': True},
            })
            pie_chart.set_title({'name': 'Expense Distribution'})
            summary_sheet.insert_chart('D18', pie_chart)
        
        # Transactions Sheet
        if not df.empty:
            df.to_excel(writer, sheet_name='Transactions', index=False)
            txn_sheet = writer.sheets['Transactions']
            
            # Apply widths and alignment to all data columns
            # Column mapping: A:Date, B:Time, C:Type, D:Category, E:Mode, F:Amount
            txn_sheet.set_column('A:B', 15, center_format) # Date, Time
            txn_sheet.set_column('C:E', 20, center_format) # Type, Category, Mode
            txn_sheet.set_column('F:F', 18, num_format)    # Amount (formatted and centered)
            
            # Highlight and Re-write headers (Row 0)
            for col_num, value in enumerate(df.columns.values):
                # Using capitalize for better presentation
                txn_sheet.write(0, col_num, value.replace('_', ' ').capitalize(), header_format)
            
    return output.getvalue()

def export_pdf(data_list, summary_data):
    output = io.BytesIO()
    doc = SimpleDocTemplate(output, pagesize=A4)
    styles = getSampleStyleSheet()
    elements = []
    
    # Title
    title_style = ParagraphStyle('TitleStyle', parent=styles['Heading1'], alignment=1, spaceAfter=20)
    elements.append(Paragraph(f"Financial Report - {summary_data.get('period', 'Full History')}", title_style))
    
    # User Info
    elements.append(Paragraph(f"<b>User:</b> {summary_data.get('user_name', 'User')}", styles['Normal']))
    elements.append(Paragraph(f"<b>Report Period:</b> {summary_data.get('period', 'Full History')}", styles['Normal']))
    elements.append(Paragraph(f"<b>Date Generated:</b> {datetime.now().strftime('%Y-%m-%d %H:%M')}", styles['Normal']))
    elements.append(Spacer(1, 0.2 * inch))
    
    # Summary Table
    summary_table_data = [
        ['Total Income', f"Rs. {summary_data['total_income']:,.2f}"],
        ['Total Expenses', f"Rs. {summary_data['total_expense']:,.2f}"],
        ['Net Savings', f"Rs. {(summary_data['total_income'] - summary_data['total_expense']):,.2f}"]
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
            row.append(Image(pie_img, width=3.5 * inch, height=3 * inch))
        if bar_img:
            row.append(Image(bar_img, width=3.5 * inch, height=3 * inch))
        chart_table_data.append(row)
        
        ct = Table(chart_table_data, colWidths=[3.6 * inch, 3.6 * inch])
        elements.append(ct)
        elements.append(Spacer(1, 0.3 * inch))
    # Detailed Transactions Table
    if data_list:
        elements.append(Paragraph("Detailed Transactions", styles['Heading2']))
        table_data = [['Date', 'Time', 'Type', 'Category', 'Mode', 'Amount']]
        for d in data_list:
            # Split date and time for better alignment
            # Handle both string and datetime objects
            raw_val = d.get('date', "")
            raw_date = str(raw_val) if raw_val else ""
            
            display_date = raw_date[:10] if len(raw_date) >= 10 else raw_date
            display_time = raw_date[11:16] if len(raw_date) >= 16 else ""
            
            table_data.append([
                display_date,
                display_time,
                d['type'],
                d['category'],
                d['mode'],
                f"Rs. {d['amount']:,.2f}"
            ])
            
        # Re-balanced column widths to fit A4 (8.27in - margins ~ 6.3in)
        dt = Table(table_data, repeatRows=1, colWidths=[1*inch, 0.6*inch, 0.7*inch, 1.5*inch, 0.8*inch, 1*inch])
        dt.setStyle(TableStyle([
            ('BACKGROUND', (0, 0), (-1, 0), colors.HexColor('#28a745')),
            ('TEXTCOLOR', (0, 0), (-1, 0), colors.whitesmoke),
            ('ALIGN', (0, 0), (-1, -1), 'CENTER'),
            ('ALIGN', (5, 1), (5, -1), 'RIGHT'), # Final amount column right-aligned
            ('FONTNAME', (0, 0), (-1, 0), 'Helvetica-Bold'),
            ('FONTSIZE', (0, 0), (-1, 0), 12),
            ('FONTSIZE', (0, 1), (-1, -1), 10), # Smaller font for data rows to prevent overflow
            ('BOTTOMPADDING', (0, 0), (-1, 0), 12),
            ('GRID', (0, 0), (-1, -1), 0.5, colors.grey),
            ('ROWBACKGROUNDS', (0, 1), (-1, -1), [colors.white, colors.whitesmoke])
        ]))
        elements.append(dt)
        
    doc.build(elements)
    return output.getvalue()
