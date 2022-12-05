import { pool } from '../config/db'
require("dotenv").config();

type User = {
  id: string;
  email: string;
};

type Project = {
  input: {
    name: string;
    description: string;
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
  },
  Mutation: {
    createProject: async (_: any,  args: Project) => {
      const result = await pool.query(`INSERT INTO projects("name", "description") VALUES(${args.input.name}, ${args.input.description});`);
      return result.rows;
    }
  }

};

