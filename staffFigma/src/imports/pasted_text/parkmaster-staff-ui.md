ParkMaster — Parking Staff UI Prompt
Design specification for building the Staff-facing interface, consistent with the existing Admin UI system

1. Design system — match admin exactly
Brand & colors
Replicate the Admin UI's visual language exactly. Do not invent a new theme.

Primary accent —
#d7ee46
(yellow-green). Used for active nav, primary CTA buttons, highlights.
Sidebar bg — near-black
#1a1a1a
(or match admin's dark sidebar exactly)
Page bg — light gray surface, white content cards
Typography
Same font stack as admin. Page title: 24px/500. Section headers: 16px/500. Body: 14px/400. Labels: 13px, muted. Table cells: 14px.

Button styles
Primary button background #d7ee46, black text, same border-radius as admin. Secondary white bg with border. Danger for destructive actions. All match admin sizing exactly.

Layout
Identical sidebar width (~240px) and structure as admin. Staff sidebar shows only role-appropriate nav items. Content area is white cards on gray page background, same spacing system.

2. Navigation sidebar — staff role
Staff sees only these nav items (no Admin-only sections like System Config, Audit Logs, Pricing & Revenue):

Dashboard (shift overview)
Vehicle Check-in
Vehicle Check-out
Active Sessions
Exceptions
Bottom: staff avatar + name + shift info + logout. Same style as Admin's bottom user card.

3. Screens to build
FR-8 / FR-9 Screen A — Vehicle check-in primary flow
This is the main working screen for staff at entry gates. Layout: two-column — left panel for input, right panel showing real-time slot availability summary.

Left panel — step-by-step check-in form:

Step 1 — Condition check FR-8.1: Gate selector dropdown (Gate 1, Gate 2…), Vehicle type selector (Motorbike / Car / EV / Bicycle — pill/tab style like admin's type filter). System auto-checks: slot availability, operating hours, blacklist. Show result as green "Eligible" or red "Not eligible" badge with reason.
Step 2 — License plate FR-8.2: Large text input for license plate (e.g. 30G-123.45 format). Button "Scan plate" (camera icon) to trigger OCR. If OCR fails → stays editable. Warn if plate already has active session.
Step 3 — Zone assignment FR-8.3: System suggests floor/zone based on vehicle type and availability. Show as clickable zone cards (e.g. B1 — Motorbikes: 45 slots free). Staff can override.
Confirm & create session FR-9.1: Summary card showing: plate, type, zone, gate, timestamp. Big primary CTA button "Create Session & Print Ticket" (same yellow-green as admin's "Manual Check-in" button). On success: show QR/ticket preview and session ID.
Right panel — slot availability widget:

Zone occupancy bars by vehicle type — same style as Admin Dashboard's "Zone Occupancy Breakdown" (B1 Motorbikes 95%, B2 Cars 80%…). Read-only. Updates live.
FR-10 Screen B — Vehicle check-out primary flow
Three-step flow laid out vertically in a centered card (similar to how admin shows session details):

Step 1 — Find session FR-10.1: Three search methods shown as tabs: "Scan ticket / QR", "License plate", "Session ID". Large search bar. Results show session card: plate, type, zone, time-in, duration so far.
Step 2 — Confirm exit & fee FR-10.2: Auto-calculated fee breakdown card. Show: duration (e.g. 2h 15m), rate applied, surcharges (overnight, overstay), total fee in VND — bold and large. Read-only; staff confirms with "Confirm exit time" button.
Step 3 — Payment FR-10.3: Payment method tabs: Cash / QR Pay / E-wallet. "Collect & Complete" button as primary CTA. On success: session status → Completed, slot → Available, optional receipt print button. Show success state inline (green checkmark, session ID).
If session not found in Step 1 → redirect button "Handle as exception →" linking to Exceptions screen.

FR-9.2 Screen C — Active sessions
Table view of all currently parked vehicles. Identical table style to Admin's "Recent Access History" table (same columns, pagination, filters).

Columns: Session ID, License Plate, Type, Zone/Slot, Time In, Duration (live counter), Est. Fee (VND), Status, Action
Status badges: Parked Overstay Pending exit — same badge style as admin's BLACKLIST badge
Filters: License plate search bar + Type dropdown + Zone dropdown — same style as admin Vehicle Management filters
Action column: "Check out" button (primary) | "Details" link
Overstay rows highlighted with subtle red left-border, same way admin flags blacklisted plates
FR-11 Screen D — Exceptions
Mirrors Admin Dashboard's "Exceptions Queue / Alerts" section but as a full page for staff to action items.

Top — exception type tabs:

Lost ticket FR-11.1 | Wrong plate FR-11.2 | Overstay FR-11.3 | Wrong zone FR-11.4 | Slot status FR-11.5
Per exception type — inline form:

Lost ticket: Search by plate → confirm vehicle info → apply lost-ticket surcharge → proceed to payment
Wrong plate: Find session → upload/enter correct plate → verification note input → update or deny exit
Overstay: Auto-flagged list; staff selects row → applies overstay policy surcharge → notifies manager (checkbox)
Wrong zone: Find session → select actual zone → update slot states (free old, occupy actual)
Slot status: Zone/slot picker → set to "Maintenance" → reason note. Cannot delete slots or change vehicle type (disabled controls with tooltip).
Each exception logs: type, description, evidence notes, staff ID, timestamp — same data model as FR-11 spec.

Screen E — Shift dashboard (home)
Simplified version of Admin's System Overview. Staff sees only their shift's data.

4 stat cards (same style as admin): Vehicles In (this shift), Vehicles Out, Revenue Collected, Pending Exceptions
Zone occupancy bars (read-only) — same as admin dashboard widget
Recent sessions table — last 10 entries from this gate/shift, same style as Admin's "Recent Parking Sessions"
No traffic charts, no payment breakdown charts — those are admin-only
Shift info banner at top: "Shift: 06:00 – 14:00 | Gate: Gate 2 | Staff: Nguyen Van A" — styled as a muted info bar
4. Component reuse rules
Reuse Admin UI's table component exactly (columns, pagination, row hover, badge styles, action links).
Reuse Admin UI's search bar + dropdown filter pattern from Vehicle Management.
Primary CTA buttons must use background: #d7ee46; color: #000; font-weight: 500 — same as admin's "Manual Check-in" button.
Status badges: same pill shape, same color semantics (green = active/ok, red = blacklist/danger, gray = offline/parked).
Sidebar: same width, same icon style, same bottom user card — only nav items differ.
The brand header "ParkMaster" + logo mark — identical to admin, no changes.
5. Staff-specific UX rules
Check-in and check-out are the primary flows — they must be reachable in ≤ 1 click from anywhere (sidebar always visible).
All forms show inline validation errors immediately (red border + message below field), not after submit.
Destructive or irreversible actions (complete session, mark lost ticket) require a confirmation step — modal or inline confirm row, not a separate page.
Staff cannot see: pricing config, system config, audit logs, user management, revenue reports — those nav items are hidden, not just disabled.
Overstay sessions in Active Sessions table auto-highlight in red without staff action — system-driven flag.
Print ticket / receipt: show a print preview modal or inline preview panel. Use browser print. Do not navigate away.
6. Screen summary
A — Check-in
2-column. Left: 4-step form (condition → plate → zone → confirm). Right: live slot summary.
B — Check-out
Centered 3-step card: find session → fee breakdown → payment + complete.
C — Active sessions
Full-width table with filters, live duration, overstay flags, quick checkout action.
D — Exceptions
Tabbed by exception type. Each tab: search → verify → action → log.
E — Shift dashboard
4 stat cards + zone bars + recent sessions. Shift info banner at top.
No additional screens needed for staff role