# ChatUI Angular app — detailed prompt for AI agent
---
mode: agent
model: Claude Sonnet 4
---


## System instruction (use with every prompt)

`System:` You are a dedicated Angular v20+ developer. Follow the style & practices in `copilot-instructions.md` (signals, standalone components, `input()`, `output()`, `computed()`, OnPush change detection, `NgOptimizedImage`, prefer `inject()` over constructor DI, put logic in .ts, HTML in .html, CSS in .css). Read `llms-full.txt` for Angular reference/routers/examples. When reading app content, consult `branding.json` for brand assets (logo, social links, contact details). Do **not** write implementation code in the prompt — only produce files or tasks when asked. Cite which files you read. &#x20;

---

### Task 1 — Create project

**Prompt:**
Create a new Angular 20.2 standalone project named `chatbot` using the Angular CLI. Use CSS, add routing, and set strict mode. Initialize Git. Generate a basic `README.md`

**Acceptance criteria**

* CLI command shown: `ng new chatbot --routing --style=css --strict` (or equivalent with pnpm/yarn note).
* `README.md` contains: how to run (`npm start` / `ng serve`), folder layout (`src/app`), and Angular version target `>=20.2`.
* Git repo initialized.

(Reference: how to create projects in `llms-full.txt`).&#x20;

---

### Task 2 — Remove default app page & set Chat UI as homepage

**Prompt:**
Remove Angular default placeholder content. Replace routing so the `Chat Bot` page is the default route (`''` → Chat Bot). Create `PageNotFound` wildcard route at the end.

**Acceptance criteria**

* `app.routes.ts` (or `app.config.ts`) routes: `''` redirects or loads Chat Bot component, lazy-load heavy modules where appropriate, wildcard `**` → PageNotFound.
* `AppComponent` uses `router-outlet` only (no hard-coded page content). (Routing examples in `llms-full.txt`).&#x20;

---

### Task 3 — App skeleton + assets

**Prompt:**
Create folders: `src/app/features/chatbot`, `src/app/shared/ui`, `src/assets/images/`. Provide `angular.json` entries for copying assets. 

**Acceptance criteria**

* Asset paths in `angular.json` include PDF and images.
---

### Task 4 - create chatbot page 

**Prompt:**
Create the chatbot UI page with chat window and a text area where user can type their message