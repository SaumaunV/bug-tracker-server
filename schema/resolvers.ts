import { GraphQLError, GraphQLScalarType, Kind } from "graphql";
import { pool } from "../config/db";
require("dotenv").config();

type Project = {
  input: {
    user_id: string;
    name: string;
    description: string;
  };
};

type Ticket = {
  input: {
    id?: string;
    name: string;
    description: string;
    type: string;
    status: string;
    priority: string;
    user_id: string | null;
    project_id: string | null;
  };
};

type User = {
  user: {
    id: string;
    username: string;
    email: string;
    password: string;
    role: string;
  };
};

export const dateScalar = new GraphQLScalarType({
  name: "Date",
  description: "Date custom scalar type",
  serialize(value: Date) {
    const date = new Date(
        value.setMinutes(value.getMinutes() - value.getTimezoneOffset())
      );
      return date;
  },
  parseValue(value: number) {
    return new Date(value);
  },
  parseLiteral(ast) {
    if (ast.kind === Kind.INT) {
      return new Date(parseInt(ast.value, 10));
    }
    return null;
  },
});

export const resolvers = {
  Date: dateScalar,
  Query: {
    user: async (_: any, args: { id: string }) => {
      const queryProjects = `Select p.* FROM projects p 
                    JOIN user_projects up ON p.id = up.project_id
                    JOIN users u ON u.id = up.user_id 
                    where u.id = $1;`;
      const user = await pool.query(
        "Select id, username, email, role from users where id= $1",
        [args.id]
      );
      const projects = await pool.query(queryProjects, [args.id]);
      const projectsID = projects.rows.map((project) => project.id);
      const totalTickets = await pool.query(
        "Select * from tickets where project_id = any($1)",
        ["{" + projectsID.join(",") + "}"]
      );
      return {
        ...user.rows[0],
        projects: projects.rows,
        allTickets: totalTickets.rows,
      };
    },
    users: async (_: any, args: any, context: User) => {
      if (!context.user) throw new GraphQLError("not authorized");
      const result = await pool.query(
        "Select id, username, email, role from users"
      );
      return result.rows;
    },
    project: async (_: any, args: { id: string }) => {
      const project = await pool.query("Select * from projects where id = $1", [
        args.id,
      ]);
      const queryUsers = `Select u.* FROM users u 
                    JOIN user_projects up ON u.id = up.user_id
                    JOIN projects p ON p.id = up.project_id 
                    where p.id = $1;`;
      const users = await pool.query(queryUsers, [args.id]);
      const tickets = await pool.query(
        "Select * from tickets where project_id = $1",
        [args.id]
      );
      return { ...project.rows[0], users: users.rows, tickets: tickets.rows };
    },
    tickets: async () => {
      const result = await pool.query("Select * from tickets");
      return result.rows;
    },
    projectTickets: async (_: any, args: { id: string }) => {
      const result = await pool.query(
        "Select * from tickets where project_id = $1",
        [args.id]
      );
      return result.rows;
    },
    userTickets: async (_: any, args: { id: string }) => {
      const result = await pool.query(
        "Select * from tickets where user_id in ($1)",
        [args.id]
      );
      return result.rows;
    },
    ticket: async (_: any, args: { id: string }) => {
      const result = await pool.query("Select * from tickets where id = $1", [
        args.id,
      ]);
      return result.rows[0];
    },
  },
  Mutation: {
    createProject: async (_: any, args: Project, context: User) => {
      if (!context.user) throw new GraphQLError("not authorized");
      const client = await pool.connect();
      const query1 =
        "INSERT INTO projects(name, description) VALUES($1, $2) RETURNING *;";
      const result = await client.query(query1, [
        args.input.name,
        args.input.description,
      ]);
      const query2 =
        "INSERT INTO user_projects(user_id, project_id) VALUES($1, $2)";
      await client.query(query2, [args.input.user_id, result.rows[0].id]);
      const result2 = await client.query(
        "Select * from users where role = 'admin' and id != $1",
        [args.input.user_id]
      );
      result2.rows.forEach((user) =>
        client.query(
          "INSERT INTO user_projects(user_id, project_id) VALUES($1, $2)",
          [user.id, result.rows[0].id]
        )
      );
      client.release();
      return result.rows[0];
    },
    createTicket: async (_: any, args: Ticket, context: User) => {
      if (!context.user) throw new GraphQLError("not authorized");
      const ticket = args.input;
      const user_id = args.input.user_id;
      const query = `INSERT INTO tickets(name, description, type, status, priority, project_id
        ${user_id ? ", user_id" : ""})
        VALUES($1, $2, $3, $4, $5, $6 ${user_id ? ", $7" : ""});`;
      const values = [
        ticket.name,
        ticket.description,
        ticket.type,
        ticket.status,
        ticket.priority,
        ticket.project_id,
      ];
      if(user_id) values.push(ticket.user_id);
      await pool.query(query, values);
      return ticket;
    },
    deleteProject: async (_: any, args: { id: string }) => {
      const query = "DELETE FROM projects WHERE id = $1";
      const values = [args.id];
      await pool.query(query, values);
      return null;
    },
    deleteTicket: async (_: any, args: { id: number }) => {
      const query = "DELETE FROM tickets WHERE id = $1";
      const values = [args.id];
      await pool.query(query, values);
      return null;
    },
    deleteUser: async (_: any, args: { id: string }) => {
      const query = "DELETE FROM users WHERE id = $1";
      const values = [args.id];
      await pool.query(query, values);
      return null;
    },
    updateUser: async (
      _: any,
      args: { role: string; id: string },
      context: User
    ) => {
      if (!context.user) throw new GraphQLError("not authorized");
      const user = await pool.query(
        "update users set role = $1 where id = $2 returning *",
        [args.role, args.id]
      );
      return user.rows[0];
    },
    updateProject: async(_: any, args: {name: string, description: string; id: string}) => {
      const {name, description, id} = args;
      const query = "update projects set name = $1, description = $2 where id = $3 returning *";
      const updatedProject = await pool.query(query, [ name, description, id ]);
      return updatedProject.rows[0];
    },
    updateTicket: async (_: any, args: Ticket) => {
      const ticket = args.input;
      const query =
        "update tickets set name = $1, description = $2, type = $3, status = $4, priority = $5, project_id = $6, user_id = $7 where id = $8 returning *";
      const user = await pool.query(query, [
        ticket.name,
        ticket.description,
        ticket.type,
        ticket.status,
        ticket.priority,
        ticket.project_id,
        ticket.user_id,
        ticket.id,
      ]);
      return user.rows[0];
    },
    addUsers: async (
      _: any,
      args: { input: { project_id: string; user_ids: string[] } }
    ) => {
      const projectID = args.input.project_id;
      args.input.user_ids.forEach((id) =>
        pool.query(
          "INSERT INTO user_projects(user_id, project_id) VALUES($1, $2)",
          [id, projectID]
        )
      );
      return null;
    },
  },
};
