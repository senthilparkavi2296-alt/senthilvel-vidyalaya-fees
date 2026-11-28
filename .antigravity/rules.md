# CRITICAL RULES – SCHOOL FEES MANAGEMENT SYSTEM

My website manages real student fee records. Data accuracy is the highest priority.

Whenever a new feature or modification is requested, follow these rules strictly:

### A. Protect student records
1. Never modify existing student fee amounts automatically.
2. Never change paid amounts, pending amounts, or previous payment records.
3. Never delete existing students or payment history.
4. Never reset or recreate the database.
5. Never change existing database records just to update the UI or design.
6. Preserve all existing student IDs and database relationships.

### B. When making fields editable
1. Make only the specifically requested fields editable.
2. Do not make student fee amounts editable unless explicitly requested.
3. Add proper validation before saving changes.
4. Do not overwrite existing values with empty or default values.
5. Update only the selected student's intended fields.

### C. Payment calculations
1. Total Fees = Existing configured fee amount.
2. Paid Amount = Sum of valid recorded payments.
3. Pending Amount = Total Fees - Paid Amount.
4. Never change historical payment transactions.
5. Prevent duplicate payment entries.

### D. Before modifying code
1. Inspect existing database schemas and API functions.
2. Identify which files and database collections are affected.
3. Preserve existing working functionality.
4. Ask for approval before making changes that could affect student fee records.

### E. After modifications
1. Test using dummy student records.
2. Verify existing student fee details remain unchanged.
3. Verify paid and pending amounts.
4. Check that previous payment history is preserved.
5. Report all modified files and database operations.

IMPORTANT: Do not modify real student fee data while implementing or testing new features.
