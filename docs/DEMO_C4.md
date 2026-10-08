# Demonstration Plan (DEMO_C4.md)

## A) Dashboard Numbers Reflecting Real Events
1. **Login** as `emp1@example.com` (Employee 1, Completed). Observe the Employee Dashboard shows 100% Policy Acknowledgement, 100% Training Completion, and 100% Quiz Pass Rate.
2. **Login** as `emp5@example.com` (Employee 5, No assignments). Observe the Dashboard says "No assignments" and there are no NaN values or crashes.
3. **Login** as `mgr1@example.com` (Manager North HR). Observe the Manager Dashboard displaying data only for the North branch / HR department team.
4. If an employee completes a new quiz or acknowledges a policy in the system, the dashboard stats dynamically recount via `/api/compliance/summary`.

## B) Authorized Exports and Scope Denial
1. **Login** as `admin@example.com`. Navigate to the Admin Dashboard.
2. Click **Export PDF Report**. The system calls `/api/reports/export/pdf`. The server generates a PDF summary (currently text-based PDF representation) applying the current global filters.
3. **Login** as `mgr1@example.com`. Click **Export CSV**. The server generates a spreadsheet neutral CSV. Formula injection is mitigated (e.g. fields starting with `=` are prefixed with a quote). The manager's scope (North / HR) is enforced by the database layer.
4. **Attempt Unauthorized Export**: Try calling `/api/reports/export/csv` using an employee token. The system returns `403 Forbidden`. Unauthenticated requests return `401 Unauthorized`.

## C) Incident Lifecycle & Audit
1. **Submission**: Log in as `emp1@example.com`. Click "Report Incident". Fill out the form, but include "password" or a fake credit card number in the description. The server correctly rejects the submission. Change the description to "Lost my physical access badge" and submit.
2. **Employee Visibility**: The incident is visible on the employee's dashboard (if implemented) or via the API.
3. **Review & Internal Notes**: Log in as `admin@example.com` or `mgr1@example.com`. Call `PATCH /api/incidents/:id/status` to move to "Under Review". Add an internal note (`POST /api/incidents/:id/notes`) saying "Checking the badge logs."
4. **Visible Update**: Employees viewing the incident details (`GET /api/incidents/:id`) see the status update in the history, but the internal notes are scrubbed.
5. **Resolution**: The admin updates the status to "Resolved", providing required `resolutionNotes`.
6. **Audit Trail**: Every action (creation, status update, adding notes, report export) is logged in the `AuditEvent` table by the `auditService`. Notifications are dispatched via `notificationService`.
