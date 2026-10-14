# Senthilvel Vidyalaya School - Fees Management System

A complete, fully functional School Fees Management web application created specifically for **Senthilvel Vidyalaya School** covering students from **LKG to 8th Standard**.

### 🏫 School Information
- **Institution**: Senthilvel Vidyalaya School
- **Campus Address**: Pakkudi, Pudukottai
- **Phone Numbers**: 9789277169, 9445987169
- **Email ID**: senthilvelvidyalaya@gmail.com
- **Curriculum**: State Board & Matriculation Curriculum (LKG - 8th Std)
- **Academic Year**: 2026–2027

---

## 🌟 Key Features

1. **Dashboard Overview**:
   - Total Expected Annual Fees, Collected Fees, Outstanding Dues, and Total Enrollment metrics.
   - Interactive class-wise collection progress and breakdown for all 10 grades (**LKG, UKG, 1st Std, 2nd Std, 3rd Std, 4th Std, 5th Std, 6th Std, 7th Std, and 8th Std**).
   - Real-time recent fee receipts feed.

2. **Student & Fees Ledger Directory**:
   - Full student profile management: Student ID, Roll Number, Standard/Class, Section, Parent Name, Mobile Contact, Email, Residential Address.
   - **Transportation (Bus / Van) Management**: Dedicated *Transport Fee* column and status badge for each student with auto-calculation into net payable total.
   - Support for Scholarships/Fee Concessions.
   - Live filtering by standard (LKG to 8th) and payment status (`Paid`, `Partial`, `Unpaid`).
   - Quick student search by ID, name, parent name, or contact number.

3. **Fee Collection Window**:
   - One-click student selection with instantaneous ledger preview (Course Base Fee, Transport Fee, Net payable, total collected, balance remaining).
   - **Transportation Payment Section**:
     - Dedicated option to include transportation fees with **Monthly** or **Yearly** billing cycles.
     - Month selector dropdown when Monthly billing is selected (e.g. June, July, August, etc.).
     - **Manual Entry & Override**: Cashiers can manually enter or adjust the **Bus Boarding Area / Stop** and the **Transportation Fee amount** directly on the billing window for receipt generation.
   - Multi-term support: Term 1, Term 2, Term 3, Annual Full Fee, Special Assessments.
   - Multiple payment gateways/modes: UPI (GPay/PhonePe), Cash, Net Banking, POS Cards, Cheque/DD.

4. **Printable Official Fee Receipts**:
   - Instant generation of standardized school fee receipts with receipt numbers (e.g. `REC-2026-1004`).
   - **Detailed Transportation Particulars on Receipt**:
     - Prominently displays the student's **Bus Boarding Area / Stop** (e.g. Pakkudi, Alangudi, Keeramangalam, etc.).
     - Displays the **Payment Plan** (Monthly with specific month name, or Full Year Annual Pass).
     - Itemized receipt table row showing the transportation fee amount with route stop badge.
     - Summary box displaying Course Base Fee, Transport Fee, Net Payable, Total Paid, and Remaining Due.
   - Senthilvel Vidyalaya School branding, campus address, breakdown of items paid, cumulative amount paid, and balance due.
   - Parent signature and Cashier/Accountant signature areas.
   - One-click printer / PDF generation via modern print styles.

5. **Annual Fee Structure & Place-Wise Transportation Structure Configuration**:
   - **Editable Column Headers**: Click directly on any column name (e.g., *Lab*, *Library*, *Tuition*, *Term*) to edit/rename it to any custom title (e.g. *Science Lab*, *Computer Lab*, *Digital Library*).
   - **Add or Remove Fee Heads**: Add custom fee heads using "+ Add Fee Head" or delete unnecessary columns.
   - **Place-Wise Transportation Fee Structure**:
     - Configure standard **Monthly** and **Yearly** transportation fees for each bus route / boarding area (e.g., Pakkudi, Alangudi, Keeramangalam, Pudukkottai Town, Vadakadu, Perungalur).
     - Students belonging to the same place automatically receive the standard transportation fee for that location!
     - School admin can add new boarding areas or delete old stops anytime with one-click **Save Transport Fees**.
   - Dynamic synchronization with fee payment checkboxes in the Fee Collection window.
   - Automatic live calculation of annual totals per class with instant database persistence on clicking **Save Changes**.

6. **Defaulter & Dues Report**:
   - Filterable report of all pending fee balances with direct calling links and quick payment collection buttons.
   - Export all transaction receipts directly to CSV format.

7. **Automated WhatsApp Parent Fee Reminders (Separate School & Van Breakdown)**:
   - **Individual 1-Click WhatsApp Reminders**: Direct WhatsApp buttons in Defaulter Report, Students Directory, and Receipt modal.
   - **Batch / Bulk Individual Reminders**: "Send Reminders to All Parents" modal creates personalized WhatsApp links for every parent with dues.
   - **Itemized School vs. Van Breakdown**: Every reminder message automatically specifies:
     - School Academic Fee: Total Fee, Paid Amount, and **Pending School Due**
     - Van / Transportation Fee: Boarding Stop, Total Fee, Paid Amount, and **Pending Van Due**
     - Overall Total Net Payable, Total Paid, and **Total Pending Balance**
     - School address, UPI payment options, and helpline numbers (9789277169 / 9445987169)
   - **Instant Payment Receipt Notices**: Every time a payment is collected at the counter, the cashier can click **"Send WhatsApp to Parent"** to dispatch the updated ledger receipt immediately!

---

## 🚀 Accessing the Website

The system is running on local port **5000**:

- **Web Portal URL**: [http://localhost:5000](http://localhost:5000)

---

## 📂 Project Structure & Location

- **Project Directory**: `C:\Users\prath\.gemini\antigravity\scratch\senthilvel-vidyalaya-fees`
  - `server.js` - REST API backend handling calculations, student records, payments, and fee structures.
  - `database.json` - Local persistent JSON database.
  - `public/index.html` - School portal UI.
  - `public/style.css` - Responsive modern dashboard styling with print-specific layout.
  - `public/app.js` - Dynamic UI interactions, live search, and receipt rendering.

---

## 🛠️ How to Restart the Application Anytime

In any terminal:
```bash
cd "C:\Users\prath\.gemini\antigravity\scratch\senthilvel-vidyalaya-fees"
node server.js
```
Then visit **http://localhost:5000** in your browser.
