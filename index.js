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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const express_graphql_1 = require("express-graphql");
const schema_1 = require("@graphql-tools/schema");
const type_defs_1 = require("./schema/type-defs");
const resolvers_1 = require("./schema/resolvers");
const cors_1 = __importDefault(require("cors"));
const bcryptjs_1 = __importDefault(require("bcryptjs"));
const passport_1 = __importDefault(require("passport"));
const express_session_1 = __importDefault(require("express-session"));
const db_1 = require("./config/db");
const passport_2 = __importDefault(require("./config/passport"));
const pgSession = require("connect-pg-simple")(express_session_1.default);
require("dotenv").config();
const schema = (0, schema_1.makeExecutableSchema)({ typeDefs: type_defs_1.typeDefs, resolvers: resolvers_1.resolvers });
const app = (0, express_1.default)();
app.use(express_1.default.json());
app.use((0, cors_1.default)({
    origin: ['https://bug-tracker-red.vercel.app', 'http://localhost:3000'],
    credentials: true
}));
app.use("/graphql", (0, express_graphql_1.graphqlHTTP)({
    schema,
    graphiql: false,
}));
app.enable('trust proxy');
app.use((0, express_session_1.default)({
    store: new pgSession({ pool: db_1.pool }),
    secret: "",
    resave: false,
    saveUninitialized: false,
    cookie: { maxAge: 1209600000, sameSite: 'none', secure: true }
}));
app.use(passport_1.default.initialize());
app.use(passport_1.default.session());
(0, passport_2.default)(passport_1.default);
app.post("/login", (req, res, next) => {
    passport_1.default.authenticate("local", (err, user, info) => {
        if (err)
            throw err;
        if (!user)
            res.json(null);
        else {
            req.logIn(user, (err) => {
                if (err)
                    return next(err);
                const { id, username, email, role } = req.user;
                res.send({ id, username, email, role });
            });
        }
    })(req, res, next);
});
app.post("/register", (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    const { username, email, password } = req.body;
    const hashedPassword = yield bcryptjs_1.default.hash(password, 10);
    try {
        const client = yield db_1.pool.connect();
        const checkUser = yield client.query("SELECT * FROM users where email= $1 or username= $2", [email, username]);
        console.log(checkUser.rows[0]);
        if (checkUser.rows[0])
            res.send({ message: 'User already exists' });
        else {
            yield client.query("INSERT INTO users(username, email, password) VALUES($1, $2, $3);", [username, email, hashedPassword]);
            client.release();
            passport_1.default.authenticate("local", (err, user, info) => {
                if (err)
                    throw err;
                if (!user)
                    res.json(null);
                else {
                    req.logIn(user, (err) => {
                        if (err)
                            return next(err);
                        const { id, username, email, role } = req.user;
                        res.send({ id, username, email, role });
                    });
                }
            })(req, res, next);
        }
    }
    catch (error) {
        res.send({ message: 'An error has occurred' });
    }
}));
app.post("/logout", (req, res, next) => {
    const sessionStore = req.sessionStore;
    sessionStore.destroy(req.sessionID, (error) => {
        if (error) {
            throw error;
        }
        req.logOut((err) => next(err));
        res.clearCookie('connect.sid');
        res.json({ success: true });
    });
});
app.get("/user", (req, res) => {
    if (req.user) {
        const { id, username, email, role } = req.user;
        res.send({ id, username, email, role });
    }
    else
        res.json(null);
});
app.listen(process.env.PORT, () => console.log("server is running"));
