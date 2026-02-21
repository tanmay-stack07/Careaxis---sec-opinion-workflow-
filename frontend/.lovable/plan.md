
## Objective
Replace the current blank `/` page with a **CareAxis CoPilot Login landing page** matching your wireframe specs, and incorporate the **uploaded CareAxis logo** at the top of the card.

---

## Key assumptions (so we can proceed without more questions)
- The uploaded image (`user-uploads://image-2.png`) is the **official logo** to display on the login card.
- This is an **MVP UI-only** login (no backend/auth yet). “Sign In”, “Forgot Password”, and “Contact Support” will be present but will be **non-functional or simulated** (loading + toast).
- Brand name to display: **CareAxis CoPilot** (even though the logo image says “CareAxis Corp”); we’ll use the logo graphic and show “CareAxis CoPilot” as the product header text.

---

## UX/UI Plan (what the user will see)
### 1) Page layout
- Full-viewport light gray background: `#F9FAFB`
- Centered card with:
  - Desktop: max width ~400px
  - Tablet: ~80% width (with max width still enforced)
  - Mobile: near full width with padding

### 2) Card header
- Logo image centered (scaled to fit, e.g., 56–72px height)
- Title: **CareAxis CoPilot**
- Tagline: **“AI-Assisted Clinical Documentation Platform”**

### 3) Form elements (with visible labels + accessibility)
- Role dropdown (Required)
  - Healthcare Worker / Doctor / Administrator
- Email input (Required)
  - Validation: must be valid email format
- Password input (Required)
  - Show/Hide toggle button (keyboard accessible, ARIA-labeled)
  - Validation: required + minimum length (e.g., 8)
- Remember Me checkbox
- Forgot Password link (placeholder)
- Primary CTA: **Sign In** (Primary Blue `#1E40AF`)
  - Loading state: “Signing in…” + spinner, disables inputs to prevent double submit

### 4) Footer strip (inside page, below card)
- Left: green dot + “Online”
- Center: compliance badges (small pill/badge style)
  - HIPAA
  - Digital Health Records Bill 2025
- Right: Language selector dropdown
  - English / Hindi / Regional
- Below or aligned right: “Need Help? Contact Support” link (placeholder)
- Responsive behavior:
  - Mobile: stack footer items into 2–3 rows, keep spacing readable

---

## States to implement (as requested)
- Default state: empty form, normal button
- Focus state: visible focus ring on all interactive elements (inputs, selects, checkbox, links, toggle, button)
- Error state: inline field error messages + `aria-invalid` + proper error association
- Loading state: disable form controls + show loading on button

---

## Implementation approach (aligned with existing codebase)
### A) Assets
- Copy `user-uploads://image-2.png` into `src/assets/` (e.g., `src/assets/careaxis-logo.png`)
- Import it in the login page as an ES module for bundling

### B) Update the landing page
- Replace `src/pages/Index.tsx` with the login layout
- Use existing UI components:
  - `Button`, `Input`, `Checkbox`, `Select`
  - `Form` wrappers from `src/components/ui/form.tsx` for consistent labeling + ARIA wiring

### C) Validation + form handling
- Implement with `react-hook-form` + `zod` + `@hookform/resolvers/zod`
- Zod schema (client-side):
  - role: required
  - email: valid email, max length limit
  - password: min length, max length limit
  - rememberMe: boolean
- On submit:
  - simulate async sign-in (e.g., 800–1200ms delay)
  - show toast success/failure (use existing toaster/sonner setup)
  - keep user on page (since no backend)

### D) Styling and design tokens
- Keep Tailwind utility styling in the page component
- Use the specified hex colors where required (background `#F9FAFB`, primary button `#1E40AF`)
- Ensure contrast ≥ 4.5:1 (especially button text and muted text)

---

## QA checklist (end-to-end)
1) Validate form errors appear and disappear correctly
2) Keyboard-only navigation:
   - tab order is logical
   - show/hide password toggle works via keyboard
3) Loading state prevents double submit and returns to normal
4) Responsiveness:
   - mobile layout is stacked and button is full width
   - tablet card ~80% width
   - desktop max width ~400px
5) Visual check: logo renders crisply and scales correctly

---

## Deliverables after implementation
- `/` route shows the CareAxis CoPilot Login landing page
- Uploaded logo integrated at top
- Complete default/focus/error/loading states
- Fully responsive + accessible form UI
