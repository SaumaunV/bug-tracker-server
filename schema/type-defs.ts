
export const typeDefs = `#graphql
    type Query {
      user(id: ID!): User
      users: [User!]
      project(id: ID!): Project!
      tickets: [Ticket!]
      projectTickets(id: ID!): [Ticket!]
      userTickets(id: ID!): [Ticket!]
      ticket(id: ID!): Ticket!
    }

    input CreateProjectInput {
      user_id: String!
      name: String!
      description: String
    }

    input CreateTicketInput {
      name: String!
      description: String!
      type: String!
      status: String!
      priority: String!
      user_id: ID = null
    }

    type Mutation {
      createProject(input: CreateProjectInput!): Project
      deleteProject(id: ID!): Project
      createTicket(input: CreateTicketInput!): Ticket
      deleteTicket(id: ID!): Ticket
      deleteUser(id: ID!): User
    }

    type User {
      id: ID!
      username: String!
      email: String!
      role: String!
      projects: [Project!]
    }

    type Project {
      id: ID!
      name: String!
      description: String
      users: [User!]
      tickets: [Ticket!]
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



