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
      const query = `INSERT INTO projects(name, description) VALUES($1, $2);`;
      const values = [`'${args.input.name}'`, `'${args.input.description}'`];
      await pool.query(query, values);
      return project;
    },
    createTicket: async (_: any, args: Ticket) => {
      const ticket = args.input;
      await pool.query(
        `INSERT INTO tickets(name, description, type, status, priority ${
          args.input.developer_id ? ", developer_id" : ""
        }) VALUES('${args.input.name}', '${args.input.description}', '${
          args.input.type
        }', '${args.input.status}', '${args.input.priority}' ${
          args.input.developer_id ? `, '${args.input.developer_id}'` : ''
        });`
      );
      return ticket;
    },
    deleteProject: async (_: any, args: { id: string }) => {
      const id = args.id;
      await pool.query(`DELETE FROM projects WHERE id = '${id}'`);
      return null;
    },
    deleteTicket: async (_: any, args: { id: number }) => {
      const id = args.id;
      await pool.query(`DELETE FROM tickets WHERE id = '${id}'`);
      return null;
    },
  },
};

