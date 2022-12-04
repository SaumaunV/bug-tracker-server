
export const typeDefs = `#graphql
    type Query {
      users: [User!]
      projects: [Project!]
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
    }
`;



