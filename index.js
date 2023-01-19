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
var express_1 = require("express");
var express_graphql_1 = require("express-graphql");
var schema_1 = require("@graphql-tools/schema");
var type_defs_1 = require("./schema/type-defs");
var resolvers_1 = require("./schema/resolvers");
var cors_1 = require("cors");
var bcryptjs_1 = require("bcryptjs");
var passport_1 = require("passport");
var express_session_1 = require("express-session");
var db_1 = require("./config/db");
var passport_2 = require("./config/passport");
var pgSession = require("connect-pg-simple")(express_session_1["default"]);
require("dotenv").config();
var schema = (0, schema_1.makeExecutableSchema)({ typeDefs: type_defs_1.typeDefs, resolvers: resolvers_1.resolvers });
var app = (0, express_1["default"])();
app.use(express_1["default"].json());
app.use((0, cors_1["default"])({
    origin: 'http://localhost:3000',
    credentials: true
}));
app.use("/graphql", (0, express_graphql_1.graphqlHTTP)({
    schema: schema,
    graphiql: true
}));
app.use((0, express_session_1["default"])({
    store: new pgSession({ pool: db_1.pool }),
    secret: process.env.SECRET,
    resave: false,
    saveUninitialized: false,
    cookie: { maxAge: 1209600000 }
}));
app.use(passport_1["default"].initialize());
app.use(passport_1["default"].session());
(0, passport_2["default"])(passport_1["default"]);
app.post("/login", function (req, res, next) {
    passport_1["default"].authenticate("local", function (err, user, info) {
        if (err)
            throw err;
        if (!user)
            res.json(null);
        else {
            req.logIn(user, function (err) {
                if (err)
                    return next(err);
                var _a = req.user, id = _a.id, username = _a.username, email = _a.email, role = _a.role;
                res.send({ id: id, username: username, email: email, role: role });
            });
        }
    })(req, res, next);
});
app.post("/register", function (req, res, next) { return __awaiter(void 0, void 0, void 0, function () {
    var _a, username, email, password, hashedPassword, client, checkUser, error_1;
    return __generator(this, function (_b) {
        switch (_b.label) {
            case 0:
                _a = req.body, username = _a.username, email = _a.email, password = _a.password;
                return [4 /*yield*/, bcryptjs_1["default"].hash(password, 10)];
            case 1:
                hashedPassword = _b.sent();
                _b.label = 2;
            case 2:
                _b.trys.push([2, 8, , 9]);
                return [4 /*yield*/, db_1.pool.connect()];
            case 3:
                client = _b.sent();
                return [4 /*yield*/, client.query("SELECT * FROM users where email= $1 or username= $2", [email, username])];
            case 4:
                checkUser = _b.sent();
                console.log(checkUser.rows[0]);
                if (!checkUser.rows[0]) return [3 /*break*/, 5];
                res.send({ message: 'User already exists' });
                return [3 /*break*/, 7];
            case 5: return [4 /*yield*/, client.query("INSERT INTO users(username, email, password) VALUES($1, $2, $3);", [username, email, hashedPassword])];
            case 6:
                _b.sent();
                client.release();
                passport_1["default"].authenticate("local", function (err, user, info) {
                    if (err)
                        throw err;
                    if (!user)
                        res.json(null);
                    else {
                        req.logIn(user, function (err) {
                            if (err)
                                return next(err);
                            var _a = req.user, id = _a.id, username = _a.username, email = _a.email, role = _a.role;
                            res.send({ id: id, username: username, email: email, role: role });
                        });
                    }
                })(req, res, next);
                _b.label = 7;
            case 7: return [3 /*break*/, 9];
            case 8:
                error_1 = _b.sent();
                res.send({ message: 'An error has occurred' });
                return [3 /*break*/, 9];
            case 9: return [2 /*return*/];
        }
    });
}); });
app.post("/logout", function (req, res, next) {
    var sessionStore = req.sessionStore;
    sessionStore.destroy(req.sessionID, function (error) {
        if (error) {
            throw error;
        }
        req.logOut(function (err) { return next(err); });
        res.clearCookie('connect.sid');
        res.json({ success: true });
    });
});
app.get("/user", function (req, res) {
    if (req.user) {
        var _a = req.user, id = _a.id, username = _a.username, email = _a.email, role = _a.role;
        res.send({ id: id, username: username, email: email, role: role });
    }
    else
        res.json(null);
});
app.listen(process.env.PORT);
