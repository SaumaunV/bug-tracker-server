
export const typeDefs = `#graphql
    scalar Date
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
      project_id: ID!
    }

    input UpdateTicketInput {
      id: ID!
      name: String!
      description: String!
      type: String!
      status: String!
      priority: String!
      user_id: ID
      project_id: ID!
    }

    type Mutation {
      createProject(input: CreateProjectInput!): Project
      deleteProject(id: ID!): Project
      createTicket(input: CreateTicketInput!): Ticket
      deleteTicket(id: ID!): Ticket
      deleteUser(id: ID!): User
      updateUser(role: String!, id: ID!): User
      updateTicket(input: UpdateTicketInput!): Ticket
    }

    type User {
      id: ID!
      username: String!
      email: String!
      role: String!
      projects: [Project!]
      allTickets: [Ticket!]
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
      created_at: Date!
      user_id: ID
      project_id: ID!
    }
`;



