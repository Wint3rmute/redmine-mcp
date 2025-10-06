/**
 * Redmine domain types and interfaces
 * These represent the core domain entities from the Redmine API
 */

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
