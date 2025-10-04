# Amalthea-Progect-Team-AGNION-
Team AGNION

# FinVriddhi 

**FinVriddhi** is a smart and professional platform designed to simplify **expense reimbursement management** for companies. It ensures **faster reimbursements, multi-level approvals, and complete transparency**.

---

## 🚀 Features

### 1. User Onboarding 👤
- New users can **Register** or **Login**.
- On first registration, a **company profile** is auto-created along with an **Admin user**.

### 2. Role & User Management 👥
- Admin can add employees and managers.
- Roles are assigned (Admin, Manager, Employee).
- Permissions are set according to roles.

### 3. Expense Submission 💳
- Employees can submit expenses with **receipts, amount, category, and date**.
- **OCR** reads bills to reduce manual errors.

### 4. Approval Workflow ✅
- Requests travel through **Approval Authorities** (configurable by admin: Manager, Finance, Director, etc.).
- At each level, the **Approval Authority** can take one of the following actions:

  1. **Approve** ✅  
     - Expense moves to the next approval level or final reimbursement if last level.

  2. **Reject** ❌ (3 types):
     - **Full Rejection**: Expense is completely rejected; employee is notified and can submit a **counter-request**.  
     - **Partial Rejection**: Only eligible portion is approved; employee receives notification to **resubmit remaining claims**.  
     - **Reject but Forward**: Expense is rejected at current level but still **moves to the next approval authority** for further review.

  3. **Request Additional Documents** 📄  
     - Employee must submit required documents before approval can proceed.

### 5. Admin Oversight 👨‍💼
- Admin can view **all company-wide expense requests** and analytics.
- Can **override approvals** in case of disputes or urgent requirements.

### 6. Employee Dashboard 📊
- Employees can track **status of requests**, view **history**, and see **which approval level** their expense is at.
- Can flag **urgent requests** for faster processing.

### 7. Multi-Level Approvals 🔄
- Admin configures the sequence and number of approval authorities.
- Flexible for simple or complex organizational hierarchies.

---

## 💡 Workflow Overview
1. Employee submits an expense.  
2. Expense travels through **Approval Authorities** as defined by admin.  
3. At each level, the authority can **Approve, Reject (Full/Partial/Forward), or Request Additional Documents**.  
4. Admin can **override** approvals at any stage.  
5. Once fully approved, reimbursement is processed.  
6. Employees and authorities can access analytics and reports.

---

## 🛠 Technology Stack
- **Backend:** Python (Flask )  
- **Frontend:** HTML, CSS, JavaScript  
- **Database:** MySQL / SQLite  
- **OCR:** For reading receipts   

---

## 🎯 Benefits
- **Faster reimbursements** with automated workflow.
- **Transparent multi-level approvals** with detailed options.
- **Full control** for admins with override functionality.
- **Real-time tracking** for employees.
- **Customizable approval flows** to match organizational hierarchy.

---

