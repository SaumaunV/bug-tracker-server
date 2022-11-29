import { Client } from 'pg';
require("dotenv").config();

const client = new Client(process.env.DATABASE_URL);

type User = {
  id: string;
  email: string;
};

export const resolvers = {
  Query: {
    hello: () => "hello there",
    users: async () => {
      await client.connect();
      const result = await client.query("Select id, email from users");
      await client.end();
      return result.rows;
      // return result.rows.map((user: User) => {
      //   return { id: user.id, email: user.email };
      // });
    },
  },
};

