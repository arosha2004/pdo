# SecuGuard Demonstration Scripts

## Script A: Policy Flow (Contribution 2)
1. **Login as Manager**: Use `manager1@acme.com` / `password`.
2. **Draft a Policy**: Currently mocked via API, but backend supports `/api/policies` `POST` route. (The UI for creating is a placeholder button for now).
3. **Login as Employee**: Use `emp1@acme.com` / `password`.
4. **View Library**: Navigate to "Policies". You will see the "Acceptable Use Policy" assigned from the seed script.
5. **Acknowledge Policy**: Click the "Acknowledge" button. The status will change to a green "Acknowledged" badge.
6. **AUP Page**: Navigate to `/policies/aup` via the URL to see the currently published version rendered.
7. **Privacy Notice**: Navigate to `/privacy` to read the monitoring notice.

## Script B: Training & Quiz Flow (Contribution 3)
1. **Login as Employee**: Use `emp1@acme.com` / `password`.
2. **View Training Modules**: Navigate to "Training" in the sidebar. You will see assigned lessons (e.g., Password Security).
3. **Start Lesson**: Click "Start" on a lesson.
4. **Progress Tracking**: Click "Next" through the slides. If you refresh the page or logout/login, your progress is saved on the backend.
5. **Finish Lesson**: On the last slide, click "Finish". The lesson status changes to "Completed" on the dashboard, and an audit log is emitted.
6. **Quiz Flow**: (API supported): Managers can draft quizzes via API `POST /api/quizzes`, publish and assign them. Employees can retrieve their quizzes (without answers keys) via `GET /api/quizzes` and submit attempts via `POST /api/quizzes/versions/:versionId/submit`. Exhausting attempts flags the assignment for manager follow-up.
7. **Notifications & Reminders**: The system runs a background cron job checking for upcoming deadlines and overdue assignments, queuing emails in the `email_outbox` table and delivering them.
