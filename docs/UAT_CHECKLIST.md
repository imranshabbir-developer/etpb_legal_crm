# IPS / ETPB Legal CRM — UAT Checklist

Use the seeded accounts after `CMS_BE: npm run db:setup`.

## Staff

- [ ] Login succeeds and Dashboard shows live totals.
- [ ] Internal / External registers load from Postgres.
- [ ] Case view and edit work; create/delete controls are unavailable.
- [ ] Reminders show live hearing lifecycle.
- [ ] Notifications persist read state and open the correct register.
- [ ] Users page and module configuration are inaccessible.

## Admin

- [ ] Create, edit, bulk delete, and clear case register actions work.
- [ ] Add, edit, and deactivate a court.
- [ ] Add/edit Staff or Admin users and change status.
- [ ] Export dashboard/register reports (PDF, CSV, DOCX).
- [ ] Settings profile/password save; module configuration is forbidden.

## Super Admin

- [ ] All Admin workflows work.
- [ ] Module flags persist and hide/show sidebar/dashboard modules.
- [ ] Super Admin accounts cannot be modified through normal user management.

## Live-data consistency

- [ ] A created/edited case is reflected after reload in its register, Dashboard totals, court cards, reports, reminders, search, and notifications.
- [ ] Updating a next hearing date refreshes reminder/notification timing.
- [ ] Completing/deciding a case removes its active reminder/notification.
- [ ] Notification read state remains after refresh and is user-specific.

## Mobile sanity

- [ ] Login remains centered at phone width.
- [ ] Sidebar/bottom navigation is usable.
- [ ] Tables scroll horizontally without hiding row actions.
- [ ] Add/edit/detail dialogs fit the viewport and remain scrollable.
- [ ] Topbar reminder and notification dropdowns fit the viewport.

## Automated pre-UAT

```sh
cd CMS_BE
npm run verify:env
npm run db:migrate
npm run test:smoke

cd ../CMS_FE
npm run build
npm run build:railway
```
