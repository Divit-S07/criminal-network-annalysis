import { gql } from "../lib/apollo";

export const USERS_QUERY = gql`
  query UsersPage($offset: Int!, $limit: Int!, $filters: String) {
    users(offset: $offset, limit: $limit, filters: $filters) {
      id
      name
      email
      role
      status
      lastActiveAt
    }
    usersAggregate {
      total
    }
  }
`;

export const ACTIVE_PROJECTS_QUERY = gql`
  query ActiveProjects($limit: Int, $status: ID) {
    projects(first: $limit, status: $status) {
      id
      name
      shortName
      status
      lead {
        id
        name
      }
      dueDate
      createdAt
    }
  }
`;
