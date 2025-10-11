---
name: Get Redmine user by ID
description: Request for a tool to fetch Redmine user details by numeric user ID
labels: enhancement, api, redmine
assignees: ""
---

## Feature Request: Get Redmine User by ID

**Summary:** Add a tool or API endpoint to the MCP server that allows fetching
Redmine user details (login, name, email, roles, etc.) by numeric user ID.

**Motivation:**

- Current tools only support filtering issues by `assigned_to_id`, but do not
  expose user details directly.
- For debugging, automation, and UI, it is useful to resolve user IDs to
  human-readable info.
- Needed for tasks like verifying assignments, displaying assignee info, and
  troubleshooting queries.

**Proposed API:**

- Tool: `get_user_by_id`
- Input: `{ user_id: number }`
- Output: `{ id, login, name, email, roles, memberships, ... }`
- Should use Redmine's `/users/:id.json` endpoint (requires admin or API
  permissions)

**Acceptance Criteria:**

- [ ] Tool is registered in MCP server
- [ ] Input validated with Zod
- [ ] Returns user details for valid ID, error for invalid/missing
- [ ] Handles permissions and error cases securely
- [ ] JSDoc and tests added

**References:**

- [Redmine REST API: Users](https://www.redmine.org/projects/redmine/wiki/Rest_Users)
- [MCP SDK documentation](https://modelcontextprotocol.io)

**Additional context:** Consider adding a tool for listing/searching users by
name or login as a follow-up.
