/**
 * Redmine domain types and interfaces
 * These represent the core domain entities from the Redmine API
 */

export interface RedmineUser {
  id: number;
  name: string;
  login?: string;
  mail?: string;
}

export interface RedmineStatus {
  id: number;
  name: string;
  is_closed?: boolean;
}

export interface RedminePriority {
  id: number;
  name: string;
  is_default?: boolean;
}

export interface RedmineProject {
  id: number;
  name: string;
  identifier: string;
  description?: string;
  status: number;
  is_public?: boolean;
  created_on: string;
  updated_on: string;
  parent?: {
    id: number;
    name: string;
  };
}

export interface RedmineIssue {
  id: number;
  subject: string;
  description?: string;
  status: RedmineStatus;
  priority: RedminePriority;
  project: {
    id: number;
    name: string;
  };
  assigned_to?: RedmineUser;
  author?: RedmineUser;
  tracker?: {
    id: number;
    name: string;
  };
  category?: {
    id: number;
    name: string;
  };
  fixed_version?: {
    id: number;
    name: string;
  };
  estimated_hours?: number;
  spent_hours?: number;
  done_ratio?: number;
  start_date?: string;
  due_date?: string;
  created_on: string;
  updated_on: string;
  closed_on?: string;
  custom_fields?: Array<{
    id: number;
    name: string;
    value: string | number | boolean;
  }>;
}

export interface RedmineActivity {
  id: number;
  name: string;
  is_default?: boolean;
}

export interface RedmineTimeEntry {
  id: number;
  hours: number;
  comments: string;
  spent_on: string;
  issue?: {
    id: number;
    subject: string;
  };
  project: {
    id: number;
    name: string;
  };
  user: RedmineUser;
  activity: RedmineActivity;
  created_on?: string;
  updated_on?: string;
  custom_fields?: Array<{
    id: number;
    name: string;
    value: string | number | boolean;
  }>;
}

/**
 * API Response wrappers
 */
export interface RedmineApiResponse<T> {
  total_count?: number;
  offset?: number;
  limit?: number;
  data?: T[];
}

export interface RedmineIssuesResponse extends RedmineApiResponse<RedmineIssue> {
  issues: RedmineIssue[];
}

export interface RedmineProjectsResponse extends RedmineApiResponse<RedmineProject> {
  projects: RedmineProject[];
}

export interface RedmineTimeEntriesResponse extends RedmineApiResponse<RedmineTimeEntry> {
  time_entries: RedmineTimeEntry[];
}

export interface RedmineUserResponse {
  user: RedmineUser;
}

/**
 * Create/Update request types
 */
export interface CreateIssueRequest {
  project_id: string | number;
  subject: string;
  description?: string;
  priority_id?: number;
  assigned_to_id?: number;
  tracker_id?: number;
  category_id?: number;
  fixed_version_id?: number;
  start_date?: string;
  due_date?: string;
  estimated_hours?: number;
  done_ratio?: number;
  custom_fields?: Array<{
    id: number;
    value: string | number | boolean;
  }>;
}

export interface CreateTimeEntryRequest {
  issue_id?: number;
  project_id?: number;
  hours: number;
  comments?: string;
  spent_on?: string;
  activity_id?: number;
  custom_fields?: Array<{
    id: number;
    value: string | number | boolean;
  }>;
}
