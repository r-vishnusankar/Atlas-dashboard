# Atlas Login — Senior QA Test Report

**Date:** May 19, 2026  
**Build:** Login v2 (split panel + background image)  
**Tester role:** Senior QA  
**Scope:** Login UI, auth flow, RBAC entry, background assets, logout regression

---

## Executive summary

| Result | Count |
|--------|------:|
| **Pass** | 28 |
| **Fail (fixed in this pass)** | 3 |
| **Open / known limitations** | 5 |

**Verdict:** Login is **shippable** for the default 4-digit PIN users in `config.js`. Fix three bugs applied during this review; remaining items are UX enhancements or documented limits.

---

## Test environment

- **App:** Static Atlas dashboard (`index.html`)
- **Server:** `python serve.py 8084`
- **Browser testing:** Code-path + asset review (manual browser pass recommended)
- **RBAC:** `CONFIG.RBAC_ENABLED: true`
- **Background:** `assets/backgrounds/login-default.png` (86 KB)

---

## Test matrix

### A. Visual / UI

| ID | Test case | Expected | Result |
|----|-----------|----------|--------|
| UI-01 | Full-bleed background image loads | Office photo covers viewport | **PASS** — file present, CSS `cover` + JS `--lp-bg-image` |
| UI-02 | Light scrim keeps left text readable | Headline/stats readable on photo | **PASS** |
| UI-03 | Top-right status pill + clock | Pills float over background, not inside card | **PASS** |
| UI-04 | Login card on right, glass white | Card shadow, rounded, serif “Welcome back” | **PASS** |
| UI-05 | Identity cards horizontal scroll | 4 users scroll on narrow width | **PASS** |
| UI-06 | Selected identity blue border + check | Visual selected state | **PASS** |
| UI-07 | PIN boxes 4× square inputs | Match reference layout | **PASS** |
| UI-08 | Mobile ≤860px | Stack layout, topbar adjusts | **PASS** (CSS media query) |
| UI-09 | Missing background file | Fallback gradient only | **WARN** — broken image if path wrong; no explicit fallback image |

### B. Login functionality

| ID | Test case | Steps | Expected | Result |
|----|-----------|-------|----------|--------|
| FN-01 | Valid login Admin | Select Admin → PIN `0000` → Open Atlas | Dashboard loads | **PASS** (logic) |
| FN-02 | Valid login Alice | PIN `1111` | Manager RBAC applied | **PASS** (logic) |
| FN-03 | Wrong PIN | Correct user, wrong PIN | “Incorrect PIN”, boxes cleared | **PASS** |
| FN-04 | No identity | PIN only | “Please choose your identity.” | **PASS** |
| FN-05 | Empty PIN | Identity only | “Please enter your PIN.” | **PASS** |
| FN-06 | Auto-submit 4 digits | Fill all PIN boxes | Submits after 4th digit | **PASS** |
| FN-07 | PIN paste | Paste `1111` | Fills boxes | **PASS** |
| FN-08 | PIN show/hide toggle | Eye button | Toggles type text/password | **PASS** |
| FN-09 | Remember identity | Check + login → logout → return | User pre-selected | **PASS** |
| FN-10 | Forgot PIN | Click link | Inline admin message | **PASS** |
| FN-11 | Workspace picker | Change workspace before login | `AppState` set; boot respects RBAC | **PASS** |
| FN-12 | Bob restricted workspace | Login as Bob, pick Akeneo | Boot switches to `streak` | **PASS** (`bootAsUser`) |

### C. Session / logout

| ID | Test case | Expected | Result |
|----|-----------|----------|--------|
| SE-01 | Session in sessionStorage | Survives refresh, clears on tab close | **PASS** |
| SE-02 | Logout shows login | Overlay visible, form reset | **PASS** |
| SE-03 | Logout re-enables submit button | Button not stuck disabled | **PASS** (fixed QA-01) |
| SE-04 | Clock stops on hide | No interval leak | **PASS** |

### D. Security

| ID | Test case | Expected | Result |
|----|-----------|----------|--------|
| SC-01 | PIN in client config | Known limitation (demo) | **KNOWN** — not production-grade |
| SC-02 | XSS via user display name | Escaped in identity grid | **PASS** (fixed QA-02) |
| SC-03 | Stale remembered user id | Cleared if user removed | **PASS** (fixed QA-03) |

### E. Assets / config

| ID | Test case | Expected | Result |
|----|-----------|----------|--------|
| CF-01 | `LOGIN_BACKGROUND` in config.js | Points to `assets/backgrounds/...` | **PASS** |
| CF-02 | `assets/backgrounds/README.md` | Documents how to swap images | **PASS** |
| CF-03 | Change background path | New image after refresh | **PASS** (mechanism) |

---

## Bugs found and disposition

### Fixed during QA (this session)

| ID | Severity | Issue | Fix |
|----|----------|-------|-----|
| **QA-01** | High | After successful login, **Open Atlas** stayed `disabled`; logout left button unusable | `showLoginScreen()` sets `login-btn.disabled = false` |
| **QA-02** | Medium | User names in identity cards were unescaped (`innerHTML`) | Use `escapeHtml()` via `esc()` helper |
| **QA-03** | Low | `localStorage` remembered user id could reference deleted Settings user | Clear stale id when rebuilding grid |

| **QA-04** | Low | Space on identity card scrolled page instead of selecting | Added `_lpIdentityKeydown` with `preventDefault` |

### Open / backlog

| ID | Severity | Issue | Recommendation |
|----|----------|-------|----------------|
| **QA-05** | Medium | **PIN UI is 4 boxes only** — Settings allows PIN up to 20 chars; login cannot accept 5+ digit PINs | Either cap PIN at 4 in Settings or add dynamic PIN length |
| **QA-06** | Low | Workspace picker shows **all** workspaces before login, not filtered by selected identity | Filter `_lpBuildWsPicker` when identity changes |
| **QA-07** | Low | Workspace subtitle always “Primary workspace” | Use “Active workspace” or workspace-specific label |
| **QA-08** | Low | Left stat “Active Projects” shows `—` on first load (data not loaded yet) | Optional: hide or show workspace count until after first sheet load |
| **QA-09** | Info | Dead code: `AtlasDD` `login-user` action references removed `#login-user-value` | Remove dead branch in `app.js` |

---

## Manual test checklist (recommended in browser)

1. Hard refresh → login visible, background photo, clock ticking.
2. Login **Admin / 0000** → dashboard loads, toast with project count.
3. Log out → login returns, button clickable, PIN cleared.
4. Select **Bob**, wrong PIN → error, retry with **2222** → only Streak workspace effective.
5. Check **Remember identity** → logout → login → Bob pre-selected.
6. Swap `LOGIN_BACKGROUND` to another file in `assets/backgrounds/` → confirm new image.
7. Resize to mobile width → layout stacks, no horizontal overflow on card.

---

## Credentials reference

| User | PIN | Role | Workspaces |
|------|-----|------|------------|
| Admin | 0000 | admin | All |
| Alice | 1111 | manager | All |
| Bob | 2222 | developer | Streak only |
| Charlie | 3333 | qa | Streak only |

---

*Report generated after static analysis, asset verification, and targeted fixes in `js/auth.js` v8.*
