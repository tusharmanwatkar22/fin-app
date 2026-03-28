## Goal Description
The goal is to complete the mobile-friendly Personal Finance Management & Tracking System with React Native (Expo) and Python FastAPI. The primary remaining works include:
1. Creating the missing frontend screens ([Income](file:///c:/Users/vansh/.gemini/antigravity/scratch/finance_tracker/backend/models.py#33-43), `Goals`, `Reports`, `Profile`).
2. Wiring up navigation in [App.js](file:///c:/Users/vansh/.gemini/antigravity/scratch/finance_tracker/frontend/App.js) properly.
3. Building out logic for Import/Export utilities in the backend.
4. Structuring UPI deep links and QR scanner functionalities.
5. Implementing budget constraint logic and alert logic in the frontend.

## Proposed Changes

### Backend Updates
#### [MODIFY] [import_utils.py](file:///c:/Users/vansh/.gemini/antigravity/scratch/finance_tracker/backend/utils/import_utils.py)
- Implement [extract_excel](file:///c:/Users/vansh/.gemini/antigravity/scratch/finance_tracker/backend/utils/import_utils.py#1-4) using `pandas`.
- Implement [extract_pdf](file:///c:/Users/vansh/.gemini/antigravity/scratch/finance_tracker/backend/utils/import_utils.py#5-8) using `PyPDF2`.
- Implement [extract_docx](file:///c:/Users/vansh/.gemini/antigravity/scratch/finance_tracker/backend/utils/import_utils.py#9-12) using `python-docx`.
- Add parsing logic to guess expenses and add them using `db.add()`.

#### [MODIFY] [export_utils.py](file:///c:/Users/vansh/.gemini/antigravity/scratch/finance_tracker/backend/utils/export_utils.py)
- Implement [export_csv](file:///c:/Users/vansh/.gemini/antigravity/scratch/finance_tracker/backend/utils/export_utils.py#1-3) using Python's [csv](file:///c:/Users/vansh/.gemini/antigravity/scratch/finance_tracker/backend/utils/export_utils.py#1-3) module.
- Implement [export_excel](file:///c:/Users/vansh/.gemini/antigravity/scratch/finance_tracker/backend/utils/export_utils.py#4-6) using `pandas`.
- Implement [export_pdf](file:///c:/Users/vansh/.gemini/antigravity/scratch/finance_tracker/backend/utils/export_utils.py#7-9) using a simple PDF gen library (e.g. `fpdf`).
- These endpoints will be mocked to save the files to a temporary or static folder and return a download link.

#### [MODIFY] [requirements.txt](file:///c:/Users/vansh/.gemini/antigravity/scratch/finance_tracker/backend/requirements.txt)
- Add missing dependencies for parsing and exporting schemas: `pandas`, `openpyxl`, `PyPDF2`, `python-docx`, `fpdf`.

### Frontend Updates
#### [MODIFY] [App.js](file:///c:/Users/vansh/.gemini/antigravity/scratch/finance_tracker/frontend/App.js)
- Import existing and new screens correctly into the Tab Navigator, removing the [DummyScreen](file:///c:/Users/vansh/.gemini/antigravity/scratch/finance_tracker/frontend/App.js#9-15) placeholders.

#### [NEW] [IncomeScreen.js](file:///c:/Users/vansh/.gemini/antigravity/scratch/finance_tracker/frontend/screens/IncomeScreen.js)
- Build a form to add income (Amount, Source, Date). Keep track via [api.js](file:///c:/Users/vansh/.gemini/antigravity/scratch/finance_tracker/frontend/services/api.js) POST to `/income/add`.

#### [NEW] [GoalsScreen.js](file:///c:/Users/vansh/.gemini/antigravity/scratch/finance_tracker/frontend/screens/GoalsScreen.js)
- Screen showing existing goals, goal progress, and ability to add new goals.

#### [NEW] [ReportsScreen.js](file:///c:/Users/vansh/.gemini/antigravity/scratch/finance_tracker/frontend/screens/ReportsScreen.js)
- Interface to select export formats (CSV, Excel, PDF) and import files into the app.

#### [NEW] [ProfileScreen.js](file:///c:/Users/vansh/.gemini/antigravity/scratch/finance_tracker/frontend/screens/ProfileScreen.js)
- Create and update profile, select a budget rule (50-30-20, etc).

#### [MODIFY] [ExpenseScreen.js](file:///c:/Users/vansh/.gemini/antigravity/scratch/finance_tracker/frontend/screens/ExpenseScreen.js)
- Replace the simple Category text input with a dedicated multi-column grid view of categories.
- Define a list of categories with emojis (e.g., 💡 Bills & Utilities, 🍽️ Food & Drinks, etc.) to match the desired premium layout.
- Update the state and styling to highlight the selected category card.

#### [MODIFY] [DashboardScreen.js](file:///c:/Users/vansh/.gemini/antigravity/scratch/finance_tracker/frontend/screens/DashboardScreen.js)
- Ensure dynamic fetching from `/summary`. Handle basic layout with placeholder charts. 

#### [MODIFY] [BudgetScreen.js](file:///c:/Users/vansh/.gemini/antigravity/scratch/finance_tracker/frontend/screens/BudgetScreen.js)
- Setup Budget rule logic (fetching rule percentages vs current expenses, alert popup if exceeded).

#### [MODIFY] [scannerService.js](file:///c:/Users/vansh/.gemini/antigravity/scratch/finance_tracker/frontend/services/scannerService.js) & [upiService.js](file:///c:/Users/vansh/.gemini/antigravity/scratch/finance_tracker/frontend/services/upiService.js)
- Finalize logic for generating deep URLs (`upi://pay?pa=...`) and handling Expo camera logic.

## Verification Plan

### Automated Tests
- Running the FastAPI backend `python -m uvicorn main:app --reload` and verifying endpoints using basic curl commands.

### Manual Verification
- Testing the Expo App via Web (`npm run web`) or Android emulator to ensure Tab Navigation works.
- Testing data binding of forms across dummy APIs or local backend.