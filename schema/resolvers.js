"use strict";
var __assign = (this && this.__assign) || function () {
    __assign = Object.assign || function(t) {
        for (var s, i = 1, n = arguments.length; i < n; i++) {
            s = arguments[i];
            for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p))
                t[p] = s[p];
        }
        return t;
    };
    return __assign.apply(this, arguments);
};
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g;
    return g = { next: verb(0), "throw": verb(1), "return": verb(2) }, typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (_) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
exports.__esModule = true;
exports.resolvers = exports.dateScalar = void 0;
var graphql_1 = require("graphql");
var db_1 = require("../config/db");
require("dotenv").config();
exports.dateScalar = new graphql_1.GraphQLScalarType({
    name: "Date",
    description: "Date custom scalar type",
    serialize: function (value) {
        return "".concat(value.getMonth() + 1, "/").concat(value.getDate(), "/").concat(value.getFullYear());
    },
    parseValue: function (value) {
        return new Date(value);
    },
    parseLiteral: function (ast) {
        if (ast.kind === graphql_1.Kind.INT) {
            return new Date(parseInt(ast.value, 10));
        }
        return null;
    }
});
exports.resolvers = {
    Date: exports.dateScalar,
    Query: {
        user: function (_, args) { return __awaiter(void 0, void 0, void 0, function () {
            var queryProjects, user, projects, projectsID, totalTickets;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        queryProjects = "Select p.* FROM projects p \n                    JOIN user_projects up ON p.id = up.project_id\n                    JOIN users u ON u.id = up.user_id \n                    where u.id = $1;";
                        return [4 /*yield*/, db_1.pool.query("Select id, username, email, role from users where id= $1", [args.id])];
                    case 1:
                        user = _a.sent();
                        return [4 /*yield*/, db_1.pool.query(queryProjects, [args.id])];
                    case 2:
                        projects = _a.sent();
                        projectsID = projects.rows.map(function (project) { return project.id; });
                        return [4 /*yield*/, db_1.pool.query("Select * from tickets where project_id = any($1)", ["{" + projectsID.join(",") + "}"])];
                    case 3:
                        totalTickets = _a.sent();
                        return [2 /*return*/, __assign(__assign({}, user.rows[0]), { projects: projects.rows, allTickets: totalTickets.rows })];
                }
            });
        }); },
        users: function (_, args, context) { return __awaiter(void 0, void 0, void 0, function () {
            var result;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        if (!context.user)
                            throw new graphql_1.GraphQLError("not authorized");
                        return [4 /*yield*/, db_1.pool.query("Select id, username, email, role from users")];
                    case 1:
                        result = _a.sent();
                        return [2 /*return*/, result.rows];
                }
            });
        }); },
        project: function (_, args) { return __awaiter(void 0, void 0, void 0, function () {
            var project, queryUsers, users, tickets;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, db_1.pool.query("Select * from projects where id = $1", [
                            args.id,
                        ])];
                    case 1:
                        project = _a.sent();
                        queryUsers = "Select u.* FROM users u \n                    JOIN user_projects up ON u.id = up.user_id\n                    JOIN projects p ON p.id = up.project_id \n                    where p.id = $1;";
                        return [4 /*yield*/, db_1.pool.query(queryUsers, [args.id])];
                    case 2:
                        users = _a.sent();
                        return [4 /*yield*/, db_1.pool.query("Select * from tickets where project_id = $1", [args.id])];
                    case 3:
                        tickets = _a.sent();
                        return [2 /*return*/, __assign(__assign({}, project.rows[0]), { users: users.rows, tickets: tickets.rows })];
                }
            });
        }); },
        tickets: function () { return __awaiter(void 0, void 0, void 0, function () {
            var result;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, db_1.pool.query("Select * from tickets")];
                    case 1:
                        result = _a.sent();
                        return [2 /*return*/, result.rows];
                }
            });
        }); },
        projectTickets: function (_, args) { return __awaiter(void 0, void 0, void 0, function () {
            var result;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, db_1.pool.query("Select * from tickets where project_id = $1", [args.id])];
                    case 1:
                        result = _a.sent();
                        return [2 /*return*/, result.rows];
                }
            });
        }); },
        userTickets: function (_, args) { return __awaiter(void 0, void 0, void 0, function () {
            var result;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, db_1.pool.query("Select * from tickets where user_id in ($1)", [args.id])];
                    case 1:
                        result = _a.sent();
                        return [2 /*return*/, result.rows];
                }
            });
        }); },
        ticket: function (_, args) { return __awaiter(void 0, void 0, void 0, function () {
            var result;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, db_1.pool.query("Select * from tickets where id = $1", [
                            args.id,
                        ])];
                    case 1:
                        result = _a.sent();
                        return [2 /*return*/, result.rows[0]];
                }
            });
        }); }
    },
    Mutation: {
        createProject: function (_, args, context) { return __awaiter(void 0, void 0, void 0, function () {
            var client, query1, result, query2, result2;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        if (!context.user)
                            throw new graphql_1.GraphQLError("not authorized");
                        return [4 /*yield*/, db_1.pool.connect()];
                    case 1:
                        client = _a.sent();
                        query1 = "INSERT INTO projects(name, description) VALUES($1, $2) RETURNING *;";
                        return [4 /*yield*/, client.query(query1, [
                                args.input.name,
                                args.input.description,
                            ])];
                    case 2:
                        result = _a.sent();
                        query2 = "INSERT INTO user_projects(user_id, project_id) VALUES($1, $2)";
                        return [4 /*yield*/, client.query(query2, [args.input.user_id, result.rows[0].id])];
                    case 3:
                        _a.sent();
                        return [4 /*yield*/, client.query("Select * from users where role = 'admin' and id != $1", [args.input.user_id])];
                    case 4:
                        result2 = _a.sent();
                        result2.rows.forEach(function (user) {
                            return client.query("INSERT INTO user_projects(user_id, project_id) VALUES($1, $2)", [user.id, result.rows[0].id]);
                        });
                        client.release();
                        return [2 /*return*/, result.rows[0]];
                }
            });
        }); },
        createTicket: function (_, args, context) { return __awaiter(void 0, void 0, void 0, function () {
            var ticket, user_id, query, values;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        if (!context.user)
                            throw new graphql_1.GraphQLError("not authorized");
                        ticket = args.input;
                        user_id = args.input.user_id;
                        query = "INSERT INTO tickets(name, description, type, status, priority, project_id\n        ".concat(user_id ? ", user_id" : "", ")\n        VALUES($1, $2, $3, $4, $5, $6 ").concat(user_id ? ", $7" : "", ");");
                        values = [
                            ticket.name,
                            ticket.description,
                            ticket.type,
                            ticket.status,
                            ticket.priority,
                            ticket.project_id,
                            ticket.user_id,
                        ];
                        return [4 /*yield*/, db_1.pool.query(query, values)];
                    case 1:
                        _a.sent();
                        return [2 /*return*/, ticket];
                }
            });
        }); },
        deleteProject: function (_, args) { return __awaiter(void 0, void 0, void 0, function () {
            var query, values;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        query = "DELETE FROM projects WHERE id = $1";
                        values = [args.id];
                        return [4 /*yield*/, db_1.pool.query(query, values)];
                    case 1:
                        _a.sent();
                        return [2 /*return*/, null];
                }
            });
        }); },
        deleteTicket: function (_, args) { return __awaiter(void 0, void 0, void 0, function () {
            var query, values;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        query = "DELETE FROM tickets WHERE id = $1";
                        values = [args.id];
                        return [4 /*yield*/, db_1.pool.query(query, values)];
                    case 1:
                        _a.sent();
                        return [2 /*return*/, null];
                }
            });
        }); },
        deleteUser: function (_, args) { return __awaiter(void 0, void 0, void 0, function () {
            var query, values;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        query = "DELETE FROM users WHERE id = $1";
                        values = [args.id];
                        return [4 /*yield*/, db_1.pool.query(query, values)];
                    case 1:
                        _a.sent();
                        return [2 /*return*/, null];
                }
            });
        }); },
        updateUser: function (_, args, context) { return __awaiter(void 0, void 0, void 0, function () {
            var user;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        if (context.user.role !== "admin")
                            throw new graphql_1.GraphQLError("not admin");
                        return [4 /*yield*/, db_1.pool.query("update users set role = $1 where id = $2 returning *", [args.role, args.id])];
                    case 1:
                        user = _a.sent();
                        return [2 /*return*/, user.rows[0]];
                }
            });
        }); },
        updateTicket: function (_, args) { return __awaiter(void 0, void 0, void 0, function () {
            var ticket, query, user;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        ticket = args.input;
                        query = "update tickets set name = $1, description = $2, type = $3, status = $4, priority = $5, project_id = $6 user_id = $7 where id = $8 returning *";
                        return [4 /*yield*/, db_1.pool.query(query, [
                                ticket.name,
                                ticket.description,
                                ticket.type,
                                ticket.status,
                                ticket.priority,
                                ticket.project_id,
                                ticket.user_id,
                                ticket.id,
                            ])];
                    case 1:
                        user = _a.sent();
                        return [2 /*return*/, user.rows[0]];
                }
            });
        }); },
        addUsers: function (_, args) { return __awaiter(void 0, void 0, void 0, function () {
            var projectID;
            return __generator(this, function (_a) {
                projectID = args.input.project_id;
                args.input.user_ids.forEach(function (id) {
                    return db_1.pool.query("INSERT INTO user_projects(user_id, project_id) VALUES($1, $2)", [id, projectID]);
                });
                return [2 /*return*/, null];
            });
        }); }
    }
};
