# Meteorflow-todos v1.0.0 — Implementation Plan

Build a reactive, real-time todo application using Meteor.js + Blaze as specified in the PRD.

## Proposed Changes

### Phase 1: Environment Setup
- Verify Node.js, Meteor, and Git are available
- Scaffold the Meteor project with `meteor create meteorflow-todos --blaze`
- Remove `autopublish` and `insecure` packages immediately
- Add required packages: `accounts-password`, `check`, `reactive-var`
- Install SortableJS via npm

### Phase 2: Data Layer — `imports/api/tasks.js`
- Define `Tasks` collection and `CATEGORIES` constant
- Implement server publication (per-user, sorted by order)
- Implement all Meteor Methods: `tasks.insert`, `tasks.remove`, `tasks.setChecked`, `tasks.updateOrder`, `tasks.updateCategory`
- All methods include auth checks and input validation

### Phase 3: Server & Client Entry Points
- **`server/main.js`** — Import the tasks API module
- **`client/main.js`** — Import tasks API + all UI templates

### Phase 4: Templates & Logic
- **`client/main.html`** — Root HTML with Inter font, viewport meta
- **`imports/ui/body.html`** — Main app template: header, task form, filter controls, task list, empty state
- **`imports/ui/body.js`** — Reactive state (hideCompleted, categoryFilter, errorMessage), SortableJS init/destroy lifecycle, helpers, events
- **`imports/ui/task.html`** — Individual task item: drag handle, checkbox, category badge, text, delete button
- **`imports/ui/task.js`** — Task helpers (categoryLower) and events (toggle, delete)
- **`imports/ui/loginForm.html`** — Auth card UI with username/password fields
- **`imports/ui/loginForm.js`** — Login/signup logic with Accounts API

### Phase 5: Styling — `client/main.css`
- CSS reset, design tokens (CSS custom properties)
- Full styling for all components: header, buttons, task items, auth page, drag states, responsive breakpoints

### Phase 6: Config Files
- **`.gitignore`** — Ignore `.meteor/local`, `node_modules/`, `*.DS_Store`
- **`README.md`** — Project documentation

## Open Questions

> [!IMPORTANT]
> **Meteor installation**: The PRD requires Meteor CLI (`meteor` command). Is Meteor already installed on your system? If not, I'll need to install it first with `npm install -g meteor`. This may take some time.

> [!NOTE]
> The PRD specifies `meteor create meteorflow-todos --blaze` which creates a subdirectory. Since we're already in the `meteorflow-todos` folder, I'll scaffold into a temp directory and move files up, or use `.` if Meteor supports it.

## Verification Plan

### Automated Tests
- Run `meteor list | grep -E "autopublish|insecure"` — must return empty
- Run `meteor run` — must start with zero console errors

### Manual Verification (Browser)
- Auth flow: register, login, logout, wrong password error
- Task CRUD: add, complete, delete tasks with categories
- Filters: hide completed, category filter
- Drag-and-drop: reorder tasks, verify persistence after reload
- Security: multi-user isolation in separate tabs
