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

/**
 * Represents a project membership in Redmine
 *
 * A membership associates a user or group with a project and assigns roles.
 * Roles can be directly assigned or inherited from group memberships.
 */
export interface RedmineMembership {
  /** Unique identifier for the membership */
  id: number;
  /** The project this membership belongs to */
  project: {
    id: number;
    name: string;
  };
  /** The user assigned to the project (mutually exclusive with group) */
  user?: {
    id: number;
    name: string;
  };
  /** The group assigned to the project (mutually exclusive with user) */
  group?: {
    id: number;
    name: string;
  };
  /** Roles assigned to this membership */
  roles: Array<{
    id: number;
    name: string;
    /** True if this role was inherited from a group membership */
    inherited?: boolean;
  }>;
}

/**
 * Response from the Redmine memberships API
 *
 * Contains a paginated list of project memberships with metadata.
 */
export interface RedmineMembershipsResponse {
  /** Array of membership objects */
  memberships: RedmineMembership[];
  /** Total number of memberships available */
  total_count: number;
  /** Current pagination offset */
  offset: number;
  /** Maximum number of results per page */
  limit: number;
}
