import { pool } from '../config/db'
require("dotenv").config();

type Project = {
  input: {
    name: string;
    description: string;
  };
};

type Ticket = {
  input: {
    name: string;
    description: string;
    type: string;
    status: string;
    priority: string;
    developer_id: string | null;
  };
};

export const resolvers = {
  Query: {
    users: async () => {
      const result = await pool.query("Select id, email from users");
      return result.rows;
    },
    projects: async () => {
      const result = await pool.query("Select * from projects");
      return result.rows;
    },
    tickets: async () => {
      const result = await pool.query("Select * from tickets");
      return result.rows;
    }
  },
  Mutation: {
    createProject: async (_: any, args: Project) => {
      const project = args.input;
      const query = 'INSERT INTO projects(name, description) VALUES($1, $2);';
      const values = [args.input.name, args.input.description];
      await pool.query(query, values);
      return project;
    },
    createTicket: async (_: any, args: Ticket) => {
      const ticket = args.input;
      const developer_id = args.input.developer_id
      const query = `INSERT INTO tickets(name, description, type, status, priority ${
        developer_id ? ", developer_id" : ""
      }) VALUES($1, $2, $3, $4, $5 ${
        developer_id ? ", $6" : ""
      });`;
      const values = [
        ticket.name,
        ticket.description,
        ticket.type,
        ticket.status,
        ticket.priority,
        ticket.developer_id
      ];
      await pool.query(query, values);
      return ticket;
    },
    deleteProject: async (_: any, args: { id: string }) => {
      const query = "DELETE FROM projects WHERE id = $1";
      const values = [args.id]
      await pool.query(query, values);
      return null;
    },
    deleteTicket: async (_: any, args: { id: number }) => {
      const query = "DELETE FROM tickets WHERE id = $1";
      const values = [args.id];
      await pool.query(query, values);
      return null;
    },
  },
};

