# General Rules (AI-First)

> **Core principle:** Consistency with the project always outweighs personal preference or AI creativity.

---

## 1. Code Quality

- Prioritize readability over cleverness. Code must be explicit, simple, and easy to maintain.
- Avoid any "magic": use constants instead of hardcoded values.
- Never use mocked data in real implementation.
- Each function, class, or module must have a single responsibility.
- Keep units small, cohesive, and testable.
- Do not duplicate business logic.
- Dependencies must be explicit.
- Always follow the project's existing patterns (naming, structure, organization, and architecture).
- Do not write comments to explain code; the code must be self-explanatory.
- Every line of code must have a real purpose — no premature abstractions, unnecessary wrappers, or overengineering.

## 2. Robustness and Error Handling

- Validate inputs and invalid states as early as possible (fail fast / early return).
- Never silently ignore errors.
- Always handle real error scenarios, edge cases, and critical user flows.

## 3. Testing

- Write the test before the implementation (test first).
- Only implement after fully understanding the requirement.
- All critical business logic must have automated tests.
- Code must be born testable.

## 4. Database

The AI **may** perform read-only queries to consult data, but must **never** perform any mutating operations. This includes:

- Creating, altering, or removing tables or schemas.
- Running migrations.
- Seeding or inserting data.
- Updating or deleting records.
- Modifying the persistence layer.

Any database change that writes, modifies, or deletes data requires a human decision.

## 5. Ownership

- When you touch a file, you own the entire file, not just the diff.
- If you find bugs, dead code, unused imports, inconsistencies, or missing tests, fix them.
- Never leave a file worse than you found it.
- If your change breaks something (related or unrelated), the responsibility is yours.

## 6. Technical Communication

- In case of ambiguity, technical conflict, or architectural trade-off, stop and communicate before implementing.
- Never silently assume requirements.
- When finishing, communicate decisions and results, not line-by-line explanations.

## 7. Git and Workflow

- All Git communication must be in **English**: commits, pull requests, titles, descriptions.
- Follow **Conventional Commits**.
- Never push directly to protected branches (`dev`, `main`, `master`, `release-*`).
- Work only on the task branch.

### Pull Requests

When opening a PR, use this pattern:

**Branch naming:** `<type>/<JIRA-ID> - Task name`

**Types:** `feature`, `hotfix`, `bugfix`, `release`, `chore`

**PR description:** Include a clear description of the changes made.

- Only push to the branch created for the task.
