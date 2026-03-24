# Finance Tracker App Walkthrough

## Project Overview
I have successfully built the complete **Personal Finance Management & Tracking System**. 

The application utilizes **React Native (Expo)** for the frontend and **Python FastAPI** backed by **SQLite** for the backend. 

### Key Accomplishments
1. **Backend Completion:**
   - Designed all API endpoints including Profile, Income, Expense, Goals, Summary, and Budget Rules.
   - Built out the parsing logic in [import_utils.py](file:///c:/Users/vansh/.gemini/antigravity/scratch/finance_tracker/backend/utils/import_utils.py) and file generation in [export_utils.py](file:///c:/Users/vansh/.gemini/antigravity/scratch/finance_tracker/backend/utils/export_utils.py) using robust libraries (`pandas`, `PyPDF2`, `python-docx`, `reportlab`).
   - All API endpoints correctly return structured JSON.

2. **Frontend UI Implementation:**
   - Integrated `react-navigation` with a `BottomTabNavigator` to seamlessly route between [Dashboard](file:///c:/Users/vansh/.gemini/antigravity/scratch/finance_tracker/frontend/screens/DashboardScreen.js#8-97), [Transactions](file:///c:/Users/vansh/.gemini/antigravity/scratch/finance_tracker/frontend/screens/TransactionsScreen.js#10-22), [Budget](file:///c:/Users/vansh/.gemini/antigravity/scratch/finance_tracker/backend/models.py#22-32), [Goals](file:///c:/Users/vansh/.gemini/antigravity/scratch/finance_tracker/frontend/screens/GoalsScreen.js#11-21), [Reports](file:///c:/Users/vansh/.gemini/antigravity/scratch/finance_tracker/frontend/screens/ReportsScreen.js#6-39), and [Profile](file:///c:/Users/vansh/.gemini/antigravity/scratch/finance_tracker/frontend/screens/ProfileScreen.js#6-37).
   - Developed the **Income Screen** to let users record their income.
   - Built out the **Goals Screen** with dynamic progress bars based on saved vs target amounts.
   - Designed the **Reports Screen** with actual Export buttons calling the backend API to retrieve base64 documents.
   - Finalized the **Profile Screen** for user detail management.
   - Transformed the dummy **Dashboard**, **Budget**, and **Transactions** screens to dynamically fetch and display actual user finances through the backend API.
   - Enforced budget limits dynamically against current rules! Example: *Exceeding 30% of your income on 'Wants' will safely alert the user.*

3. **Advanced Features Integration:**
   - **QR Scanner:** Integrated `expo-camera` in the [ExpenseScreen](file:///c:/Users/vansh/.gemini/antigravity/scratch/finance_tracker/frontend/screens/ExpenseScreen.js#8-125) to quickly capture a UPI QR code string, which gets correctly parsed by our custom [scannerService.js](file:///c:/Users/vansh/.gemini/antigravity/scratch/finance_tracker/frontend/services/scannerService.js).
   - **UPI Payments:** Implemented `upi://pay` deep linking through Expo's intrinsic `Linking` mechanism in [upiService.js](file:///c:/Users/vansh/.gemini/antigravity/scratch/finance_tracker/frontend/services/upiService.js). Users inputting a payee ID and Amount are forwarded straight to their installed UPI Apps (GPay, PhonePe, Paytm). The expense gets auto-logged right after.

## Verification & Execution Instructions

### Running the Backend (FastAPI)
1. Open up a terminal in `backend/` directory.
2. Ensure you have installed the fully updated dependencies:
   ```bash
   pip install -r requirements.txt
   ```
3. Start the server (runs on `localhost:8000` by default):
   ```bash
   uvicorn main:app --reload
   ```

### Running the Frontend (Expo / React Native)
1. Open up a terminal in the `frontend/` directory.
2. Install standard Node dependencies:
   ```bash
   npm install
   ```
3. Start the Expo bundler:
   ```bash
   npx expo start
   ```
4. If running locally with physical devices, download the **Expo Go** app on your phone and scan the QR code generated in the terminal.

Enjoy tracking your finances effortlessly!
