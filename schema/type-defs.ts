
export const typeDefs = `#graphql
    type Query {
      users: [User!]
      projects: [Project!]
    }

    input CreateProjectInput {
      name: String
      description: String
    }

    type Mutation {
      createProject(input: CreateProjectInput!): Project
      deleteProject(id: ID!): Project
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



