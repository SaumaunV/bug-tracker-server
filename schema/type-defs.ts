
export const typeDefs = `#graphql
    type Query {
      users: [User!]
      projects: [Project!]
      tickets: [Ticket!]
    }

    input CreateProjectInput {
      name: String
      description: String
    }

    input CreateTicketInput {
      name: String!
      description: String!
      type: String!
      status: String!
      priority: String!
      developer_id: ID = null
    }

    type Mutation {
      createProject(input: CreateProjectInput!): Project
      deleteProject(id: ID!): Project
      createTicket(input: CreateTicketInput!): Ticket
      deleteTicket(id: ID!): Ticket
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

    type Ticket {
      id: ID!
      name: String!
      description: String!
      type: String!
      status: String!
      priority: String!
      developer_id: ID
    }
`;



