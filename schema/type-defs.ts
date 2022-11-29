
export const typeDefs = `#graphql
    type Query {
      hello: String
      users: [User!]
    }

    type Mutation {
      createProject: Project
    }

    type User {
      id: ID!
      email: String!
    }

    type Project {
      id: ID!
      name: String!
      description: String
      users: [User!]
    }
`;



