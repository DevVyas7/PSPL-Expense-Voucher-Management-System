# PSPL Expense Voucher Management System

## About the project

The PSPL Expense Voucher Management System is a full-stack web
application built for Prachay Securities Private Limited (PSPL) as part
of a Full Stack Developer Internship assignment.

It helps employees prepare and submit expense vouchers, lets a Director
review and approve or reject them, and gives the Accounts Team read-only
access to voucher records for reimbursement tracking. Each role has its
own dashboard and permissions.

## What the application can do

-   **Separate access for each role:** Employees, the Director, and the
    Accounts Team see the pages and actions relevant to their work.
-   **Create and manage drafts:** Employees can save a voucher as a
    draft and edit or delete it before submission.
-   **Submit for approval:** A submitted voucher must contain the
    required information and an employee signature. After submission,
    the employee can no longer edit it.
-   **Approve or reject vouchers:** The Director can approve a pending
    voucher with a signature or reject it with a reason.
-   **Read-only accounts view:** The Accounts Team can review vouchers
    across the organisation, including their status and signatures, but
    cannot change them.
-   **Unique voucher numbers:** The application generates voucher
    numbers in the `EXP-YYYY-XXXX` format using a MongoDB counter.
-   **Signature options:** A user can upload a JPEG, PNG, or WebP image
    (up to 2 MB) or draw a signature on a canvas.
-   **Search and filters:** Vouchers can be searched and filtered by
    details such as voucher number, employee, department, category,
    status, date, and amount. Sorting is also available.
-   **Printable records:** Voucher details include print-friendly
    styling.

## Technology used

### Frontend

-   React with Vite
-   JavaScript and JSX
-   Plain CSS
-   React Router
-   Axios for API requests

### Backend

-   Node.js
-   Express
-   MongoDB with Mongoose
-   JSON Web Tokens (JWT) for authentication
-   `bcryptjs` for password hashing
-   Multer for signature uploads

The project uses JavaScript and plain CSS; it does not require
TypeScript, Tailwind CSS, or Bootstrap.

## Before you start

Install the following on your computer:

1.  **Node.js** (18.x, 20.x, or 24.x is listed as supported by the
    project).
2.  **npm** (version 9 or later).
3.  **MongoDB**, running locally on port `27017`, or a MongoDB Atlas
    connection string.

You can check your installed versions with:

``` bash
node -v
npm -v
```

## Project structure

The main folders are organised as follows:

``` text
Expense Voucher Management System/
├── backend/
│   ├── config/          # Database connection
│   ├── controllers/     # Authentication, dashboard and voucher logic
│   ├── middleware/      # Authentication, permissions and uploads
│   ├── models/          # User, voucher and counter schemas
│   ├── routes/          # API routes
│   ├── scripts/         # Database seeding and API tests
│   ├── uploads/         # Uploaded signature images
│   ├── .env.example     # Environment variable template
│   ├── package.json
│   └── server.js        # Backend entry point
├── frontend/
│   ├── public/
│   ├── src/
│   │   ├── components/  # Shared UI components
│   │   ├── context/     # Authentication state
│   │   ├── layouts/     # Shared application layout
│   │   ├── pages/       # Login, dashboards and voucher pages
│   │   ├── services/    # API client
│   │   └── styles/      # CSS files
│   ├── package.json
│   └── vite.config.js
├── .gitignore
└── README.md
```

## Set up the project

Run the commands below from a terminal. If you have already opened the
project folder, you do not need to clone it again.

### 1. Install backend dependencies

``` bash
cd backend
npm install
```

### 2. Install frontend dependencies

Open another terminal, or return to the project root before entering the
frontend folder:

``` bash
cd frontend
npm install
```

### 3. Configure MongoDB

Make sure the MongoDB service is running. On Windows, you can check its
status in PowerShell with:

``` powershell
Get-Service -Name MongoDB
```

If you use MongoDB Atlas or a different local database, update the
connection string in `backend/.env`.

### 4. Set up environment variables

Create a `backend/.env` file using `backend/.env.example` as a guide.
For a local setup, the values should look similar to this:

``` env
PORT=5000
MONGODB_URI=mongodb://127.0.0.1:27017/expenseVoucherDB
JWT_SECRET=replace_this_with_a_long_random_secret
JWT_EXPIRES_IN=1d
CLIENT_URL=http://localhost:5173
NODE_ENV=development
```

Replace the example JWT secret with your own long, random value. Do not
commit your real `.env` file or production secrets to GitHub.

### 5. Add the demonstration data

From the `backend` folder, run:

``` bash
npm run seed
```

This script creates the demonstration accounts and sample vouchers. It
is designed to be safe to run more than once without creating duplicate
records.

### 6. Start the backend

In a terminal opened in the `backend` folder:

``` bash
npm run dev
```

The backend should be available at `http://localhost:5000`.

### 7. Start the frontend

Open a second terminal and move to the `frontend` folder:

``` bash
npm run dev
```

Vite will display the local frontend address, normally
`http://localhost:5173`. Open that address in your browser.

## Demo accounts

The database seed script provides the following demonstration accounts for local evaluation:

### Employee Accounts

Each employee account is completely isolated. Employees can **only** view, edit, and track their own expense vouchers, and cannot access other employees' records.

| Employee Name | Corporate Email | Employee ID | Department | Password |
| :--- | :--- | :--- | :--- | :--- |
| **Rahul Sharma** | `rahul@prachay.com` | `PSPL-EMP-1001` | Finance | `Password@123` |
| **Priya Patel** | `priya@prachay.com` | `PSPL-EMP-1002` | Human Resources | `Password@123` |
| **Arjun Mehta** | `arjun@prachay.com` | `PSPL-EMP-1003` | Technology | `Password@123` |
| **Neha Desai** | `neha@prachay.com` | `PSPL-EMP-1004` | Marketing | `Password@123` |
| **Amit Verma** | `amit@prachay.com` | `PSPL-EMP-1005` | Operations | `Password@123` |

### Executive & Financial Oversight Accounts

| Role | Name | Corporate Email | Employee ID | Permissions | Password |
| :--- | :--- | :--- | :--- | :--- | :--- |
| **Director** | Ananya Deshmukh | `director@prachay.com` | `PSPL-DIR-001` | Full organization view; authorize claims with digital signature; reject with mandatory feedback | `Password@123` |
| **Accounts Team** | Vikram Patel | `accounts@prachay.com` | `PSPL-ACC-005` | Strictly read-only organization ledger oversight; payout calculation; zero edit/delete access | `Password@123` |

> **Data Isolation Note**: The backend strictly scopes employee database queries and API endpoints (`req.user.role === 'Employee'`). An employee attempting to access or edit another employee's voucher by modifying a URL ID or sending forged API payloads is immediately rejected with `403 Forbidden`.

These credentials are demonstration accounts for local development and review. The login portal includes a quick demo selector dropdown and instant one-click login buttons.

## How the voucher workflow works

1.  **Create a draft:** An employee enters the expense details. A
    signature is not needed just to save a draft.
2.  **Submit the voucher:** The employee completes the required fields
    and adds a signature. The voucher moves to **Pending Approval** and
    becomes read-only for that employee.
3.  **Director reviews it:** The Director can approve the voucher after
    adding a signature, or reject it by providing a reason.
4.  **Accounts Team reviews the record:** The Accounts Team can view
    vouchers and monitor approved expenses, but cannot edit, approve, or
    reject them.
5.  **Employee checks a rejection:** If a voucher is rejected, the
    employee can view the reason recorded by the Director.

Voucher numbers use the format `EXP-YYYY-XXXX`, for example
`EXP-2026-0001`.

## Roles and permissions

  Action                                    Employee   Director              Accounts Team
  ----------------------------------------- ---------- --------------------- ---------------
  View own vouchers                         Yes        Yes                   Yes
  View other employees' vouchers            No         Yes                   Yes
  Create vouchers                           Yes        No                    No
  Edit or delete own drafts                 Yes        No                    No
  Edit or delete submitted vouchers         No         No                    No
  Submit a voucher                          Yes        No                    No
  Approve a pending voucher                 No         Yes, with signature   No
  Reject a pending voucher                  No         Yes, with reason      No
  View organisation-wide expense records    No         Yes                   Yes
  Modify employee-entered expense details   No         No                    No

## Database overview

The application uses three main MongoDB models.

### User

Stores each user's name, email, hashed password, role, employee ID, and
creation date. Passwords are hashed with `bcryptjs` and should not be
returned in API responses.

### Counter

Keeps the sequence used to generate voucher numbers. The counter is
updated atomically so two requests are less likely to receive the same
number.

### Voucher

Stores the voucher number and dates, department, expense title and
category, description, amount, employee details, signatures, status,
Director details, approval date, rejection reason, and rejection date.
Mongoose timestamps also track when a record was created and last
updated.

The available expense categories are Travel, Food, Accommodation, Office
Supplies, Transportation, and Other.

## API overview

The backend exposes the following main endpoints. Requests that require
a signed-in user must include a valid JWT.

### Authentication --- `/api/auth`

  Method   Endpoint            Purpose
  -------- ------------------- ----------------------------------
  POST     `/api/auth/login`   Sign in with email and password
  GET      `/api/auth/me`      Check the current user's session

### Vouchers --- `/api/vouchers`

  -----------------------------------------------------------------------------
  Method                  Endpoint                      Purpose
  ----------------------- ----------------------------- -----------------------
  GET                     `/api/vouchers`               List vouchers; supports
                                                        search, filters and
                                                        sorting

  GET                     `/api/vouchers/:id`           Get a voucher's details

  POST                    `/api/vouchers`               Create a draft
                                                        (Employee)

  PUT                     `/api/vouchers/:id`           Update an owned draft
                                                        (Employee)

  DELETE                  `/api/vouchers/:id`           Delete an owned draft
                                                        (Employee)

  POST                    `/api/vouchers/:id/submit`    Submit a draft for
                                                        approval

  POST                    `/api/vouchers/:id/approve`   Approve a pending
                                                        voucher (Director)

  POST                    `/api/vouchers/:id/reject`    Reject a pending
                                                        voucher (Director)
  -----------------------------------------------------------------------------

The list endpoint supports search and filters such as `department`,
`category`, `status`, `startDate`, `endDate`, `minAmount`, and
`maxAmount`, along with the `sortBy` parameter. Employee requests are
limited to vouchers owned by the signed-in employee.

### Dashboards --- `/api/dashboard`

  ---------------------------------------------------------------------------
  Method                  Endpoint                    Purpose
  ----------------------- --------------------------- -----------------------
  GET                     `/api/dashboard/employee`   Employee voucher counts
                                                      and recent vouchers

  GET                     `/api/dashboard/director`   Pending approvals and
                                                      recent approval
                                                      activity

  GET                     `/api/dashboard/accounts`   Voucher totals and
                                                      approved expense
                                                      figures
  ---------------------------------------------------------------------------

### Signature uploads

  -----------------------------------------------------------------------------------
  Method                  Endpoint                            Purpose
  ----------------------- ----------------------------------- -----------------------
  POST                    `/api/upload/signature`             Upload a signature
                                                              image

  GET                     `/uploads/:filename`                Retrieve an authorised
                                                              signature image

  GET                     `/api/upload/signature/:filename`   Retrieve an authorised
                                                              signature image
  -----------------------------------------------------------------------------------

Signature retrieval requires authentication and checks whether the user
is allowed to view the related voucher. Supported image types are JPEG,
PNG, and WebP, with a maximum file size of 2 MB.

## Validation and access rules

-   Voucher amounts must be greater than zero.
-   Voucher numbers must be unique.
-   An employee signature is required before submission.
-   Only a pending voucher can be approved or rejected.
-   The Director must add a signature to approve a voucher.
-   The Director must provide a reason to reject a voucher.
-   Employees can update or delete only their own drafts.
-   The Director cannot change the employee's expense details during
    review.
-   The Accounts Team has read-only access.
-   Signature uploads are limited by file type and size.

## Running the tests

The backend contains an API integration test script. From the `backend`
folder, run the test command configured in `package.json`:

``` bash
npm test
```

The test suite is intended to cover login, role permissions, voucher
creation and submission, approval and rejection rules, and dashboard
data. Run it against a test database or a development database whose
contents can safely be changed. Check the test output to confirm the
actual result in your environment.

## Assumptions and limitations

-   **One approval level:** The workflow uses the Director as the
    approver. Additional approval levels are not included.
-   **No payment gateway:** The Accounts Team tracks approved claims;
    the application does not send payments through a payment gateway.
-   **Local signature storage:** Uploaded signature images are stored on
    the backend server's disk. A deployment with multiple backend
    instances would need shared storage, such as an object storage
    service.
-   **Browser token storage:** The current application stores the
    authentication token and basic user information in browser
    `localStorage`. This is a project limitation to consider before
    production deployment.

## Project notes

This project was developed for the Prachay Securities Private Limited
(PSPL) Full Stack Developer Internship evaluation. It uses the MERN
stack: MongoDB, Express, React, and Node.js.

For local development, start MongoDB first, then the backend, and
finally the frontend. If something does not start, check that the
environment variables are set correctly and that the required ports are
available.
