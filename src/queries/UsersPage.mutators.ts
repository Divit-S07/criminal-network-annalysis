import { gql, useMutation } from "../lib/apollo";

export const UPDATE_USER_STATUS_MUTATION = gql`
  mutation UpdateUserStatus($input: UpdateUserStatusInput!) {
    updateUserStatus(input: $input) {
      id
      status
    }
  }
`;

export function useUpdateUserStatus() {
  return useMutation(UPDATE_USER_STATUS_MUTATION);
}

export const ADD_NEW_PROJECT_MUTATION = gql`
  mutation AddNewProject($input: AddProjectInput!) {
    addProject(input: $input) {
      id
      name
      shortName
      status
      lead {
        id
        name
      }
      dueDate
    }
  }
`;

export function useAddNewProject() {
  return useMutation(ADD_NEW_PROJECT_MUTATION);
}
