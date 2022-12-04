import { client } from '../config/db'
require("dotenv").config();

type User = {
  id: string;
  email: string;
};

export const resolvers = {
  Query: {
    users: async () => {
      await client.connect();
      const result = await client.query("Select id, email from users");
      await client.end();
      return result.rows;
    },
    projects: async () => {
      await client.connect();
      const result = await client.query("Select * from projects");
      await client.end();
      return result.rows;
    },
  }
};

