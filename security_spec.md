# Security Specification & Payload-First TDD

## 1. Data Invariants
1. **Default Deny Safety Net**: Every unmatched path under `/databases/{database}/documents` is denied for both reads and writes.
2. **Verified Admin RBAC**: Administrator privileges are granted strictly to:
   - The bootstrapped Super Admin (`eng.apoorv@gmail.com` with `email_verified == true`), OR
   - Active entries in `/admins/{email}` where `isActive == true` and `email_verified == true`.
   - Role tiers (`super_admin`, `event_admin`, `content_admin`, `team_admin`) restrict mutations to each admin's domain.
3. **PII Isolation**: `/registrations` and `/contact_messages` contain PII (`collegeEmail`, `contactNumber`, `email`). Public `read`/`get`/`list` is strictly denied. Only authorized admins can read them.
4. **Atomic Duplicate Registration Prevention**: Public `create` on `/registrations/{registrationId}` requires an existing event with `registrationOpen == true` AND an atomic `existsAfter` write to `/registration_locks/{lockId}` where `lockId` starts with `{eventId}__`. `registration_locks` forbids `read` and `update`, guaranteeing one submission per email per event.
5. **Strict Field Allowlisting & Temporal Integrity**: Every `create` checks `keys().hasAll(...)` + `keys().hasOnly(...)` and enforces `createdAt == request.time`. Every `update` validates the full incoming entity via `isValid[Entity]()` and checks `updatedAt == request.time`.
6. **Path Variable Hardening**: Single-document operations validate `isValidId(docId)` (`^[a-zA-Z0-9_\-]+$`, max 128 chars) or `isValidEmailDocId(adminEmail)` for `/admins`.

## 2. The "Dirty Dozen" Attack Payloads (All Must Return PERMISSION_DENIED)
1. **Unverified Admin Email Spoof**: Signed-in user with `email: "eng.apoorv@gmail.com"` and `email_verified: false` attempts to write `/site_settings/main`.
2. **Self-Privilege Escalation**: Non-admin signed-in user attempts to create `/admins/attacker@evil.com` with `role: "super_admin"`.
3. **Shadow Field Injection on Registration**: Public visitor submits `/registrations/reg1` with extra ghost field `isApprovedByAdmin: true`.
4. **Oversized ID Poisoning**: Attacker attempts `setDoc` at `/contact_messages/${'a'.repeat(500)}`.
5. **PII Scraping on Registrations**: Public or non-admin user attempts `getDocs(collection(db, 'registrations'))`.
6. **PII Scraping on Contact Messages**: Non-admin user attempts `getDoc(doc(db, 'contact_messages', 'msg1'))`.
7. **Duplicate Registration Bypass**: Visitor submits a second registration with an already-used `lockId` or attempts `update` on `/registration_locks/{lockId}`.
8. **Closed Event Registration Bypass**: Visitor submits `/registrations/reg2` referencing an event where `registrationOpen == false`.
9. **Orphaned Registration Attack**: Visitor submits `/registrations/reg3` referencing non-existent `eventId: "fake_event_999"`.
10. **Honeypot Spam Attack**: Bot submits `/contact_messages/msg2` with non-empty `honeypot: "buy-now"`.
11. **Timestamp Forgery**: Event Admin attempts to create `/events/ev1` with backdated `createdAt` instead of `request.time`.
12. **Cross-Role Unauthorized Write**: A `team_admin` (non-super, non-event admin) attempts to delete an event in `/events/ev1`.
