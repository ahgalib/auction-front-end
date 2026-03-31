export const REGISTER_MUTATION = `
  mutation Register($name: String!, $email: String!, $password: String!) {
    register(name: $name, email: $email, password: $password) {
      id
      name
      email
    }
  }
`;

export const LOGIN_MUTATION = `
  mutation Login($email: String!, $password: String!) {
    login(email: $email, password: $password) {
      access_token
      token_type
      expires_in
      scope
    }
  }
`;

export const OAUTH_TOKEN_MUTATION = `
  mutation OAuthToken(
    $grantType: String!
    $clientId: Int!
    $clientSecret: String!
    $username: String!
    $password: String!
    $scope: String
  ) {
    oauthToken(
      grantType: $grantType
      clientId: $clientId
      clientSecret: $clientSecret
      username: $username
      password: $password
      scope: $scope
    ) {
      access_token
      token_type
      expires_in
      scope
    }
  }
`;

export const LOGOUT_MUTATION = `
  mutation Logout {
    logout
  }
`;
