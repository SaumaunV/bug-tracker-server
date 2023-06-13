"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.resolvers = exports.dateScalar = void 0;
const graphql_1 = require("graphql");
const db_1 = require("../config/db");
require("dotenv").config();
exports.dateScalar = new graphql_1.GraphQLScalarType({
    name: "Date",
    description: "Date custom scalar type",
    serialize(value) {
        const date = new Date(value.setMinutes(value.getMinutes() - value.getTimezoneOffset()));
        return date;
    },
    parseValue(value) {
        return new Date(value);
    },
    parseLiteral(ast) {
        if (ast.kind === graphql_1.Kind.INT) {
            return new Date(parseInt(ast.value, 10));
        }
        return null;
    },
});
exports.resolvers = {
    Date: exports.dateScalar,
    Query: {
        user: (_, args) => __awaiter(void 0, void 0, void 0, function* () {
            const queryProjects = `Select p.* FROM projects p 
                    JOIN user_projects up ON p.id = up.project_id
                    JOIN users u ON u.id = up.user_id 
                    where u.id = $1;`;
            const user = yield db_1.pool.query("Select id, username, email, role from users where id= $1", [args.id]);
            const projects = yield db_1.pool.query(queryProjects, [args.id]);
            const projectsID = projects.rows.map((project) => project.id);
            const totalTickets = yield db_1.pool.query("Select * from tickets where project_id = any($1)", ["{" + projectsID.join(",") + "}"]);
            return Object.assign(Object.assign({}, user.rows[0]), { projects: projects.rows, allTickets: totalTickets.rows });
        }),
        users: (_, args, context) => __awaiter(void 0, void 0, void 0, function* () {
            if (!context.user)
                throw new graphql_1.GraphQLError("not authorized");
            const result = yield db_1.pool.query("Select id, username, email, role from users");
            return result.rows;
        }),
        project: (_, args) => __awaiter(void 0, void 0, void 0, function* () {
            const project = yield db_1.pool.query("Select * from projects where id = $1", [
                args.id,
            ]);
            const queryUsers = `Select u.* FROM users u 
                    JOIN user_projects up ON u.id = up.user_id
                    JOIN projects p ON p.id = up.project_id 
                    where p.id = $1;`;
            const users = yield db_1.pool.query(queryUsers, [args.id]);
            const tickets = yield db_1.pool.query("Select * from tickets where project_id = $1", [args.id]);
            return Object.assign(Object.assign({}, project.rows[0]), { users: users.rows, tickets: tickets.rows });
        }),
        tickets: () => __awaiter(void 0, void 0, void 0, function* () {
            const result = yield db_1.pool.query("Select * from tickets");
            return result.rows;
        }),
        projectTickets: (_, args) => __awaiter(void 0, void 0, void 0, function* () {
            const result = yield db_1.pool.query("Select * from tickets where project_id = $1", [args.id]);
            return result.rows;
        }),
        userTickets: (_, args) => __awaiter(void 0, void 0, void 0, function* () {
            const result = yield db_1.pool.query("Select * from tickets where user_id in ($1)", [args.id]);
            return result.rows;
        }),
        ticket: (_, args) => __awaiter(void 0, void 0, void 0, function* () {
            const result = yield db_1.pool.query("Select * from tickets where id = $1", [
                args.id,
            ]);
            return result.rows[0];
        }),
    },
    Mutation: {
        createProject: (_, args, context) => __awaiter(void 0, void 0, void 0, function* () {
            if (!context.user)
                throw new graphql_1.GraphQLError("not authorized");
            const client = yield db_1.pool.connect();
            const query1 = "INSERT INTO projects(name, description) VALUES($1, $2) RETURNING *;";
            const result = yield client.query(query1, [
                args.input.name,
                args.input.description,
            ]);
            const query2 = "INSERT INTO user_projects(user_id, project_id) VALUES($1, $2)";
            yield client.query(query2, [args.input.user_id, result.rows[0].id]);
            const result2 = yield client.query("Select * from users where role = 'admin' and id != $1", [args.input.user_id]);
            result2.rows.forEach((user) => client.query("INSERT INTO user_projects(user_id, project_id) VALUES($1, $2)", [user.id, result.rows[0].id]));
            client.release();
            return result.rows[0];
        }),
        createTicket: (_, args, context) => __awaiter(void 0, void 0, void 0, function* () {
            if (!context.user)
                throw new graphql_1.GraphQLError("not authorized");
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
            if (user_id)
                values.push(ticket.user_id);
            yield db_1.pool.query(query, values);
            return ticket;
        }),
        deleteProject: (_, args) => __awaiter(void 0, void 0, void 0, function* () {
            const query = "DELETE FROM projects WHERE id = $1";
            const values = [args.id];
            yield db_1.pool.query(query, values);
            return null;
        }),
        deleteTicket: (_, args) => __awaiter(void 0, void 0, void 0, function* () {
            const query = "DELETE FROM tickets WHERE id = $1";
            const values = [args.id];
            yield db_1.pool.query(query, values);
            return null;
        }),
        deleteUser: (_, args) => __awaiter(void 0, void 0, void 0, function* () {
            const query = "DELETE FROM users WHERE id = $1";
            const values = [args.id];
            yield db_1.pool.query(query, values);
            return null;
        }),
        updateUser: (_, args, context) => __awaiter(void 0, void 0, void 0, function* () {
            if (!context.user)
                throw new graphql_1.GraphQLError("not authorized");
            const user = yield db_1.pool.query("update users set role = $1 where id = $2 returning *", [args.role, args.id]);
            return user.rows[0];
        }),
        updateProject: (_, args) => __awaiter(void 0, void 0, void 0, function* () {
            const { name, description, id } = args;
            const query = "update projects set name = $1, description = $2 where id = $3 returning *";
            const updatedProject = yield db_1.pool.query(query, [name, description, id]);
            return updatedProject.rows[0];
        }),
        updateTicket: (_, args) => __awaiter(void 0, void 0, void 0, function* () {
            const ticket = args.input;
            const query = "update tickets set name = $1, description = $2, type = $3, status = $4, priority = $5, project_id = $6, user_id = $7 where id = $8 returning *";
            const user = yield db_1.pool.query(query, [
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
        }),
        addUsers: (_, args) => __awaiter(void 0, void 0, void 0, function* () {
            const projectID = args.input.project_id;
            args.input.user_ids.forEach((id) => db_1.pool.query("INSERT INTO user_projects(user_id, project_id) VALUES($1, $2)", [id, projectID]));
            return null;
        }),
    },
};
