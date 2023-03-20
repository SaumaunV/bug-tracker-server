import express, { Request } from "express";
import { graphqlHTTP } from "express-graphql";
import { makeExecutableSchema } from "@graphql-tools/schema";
import { typeDefs } from "./schema/type-defs";
import { resolvers } from "./schema/resolvers";
import cors from "cors";
import bcrypt from "bcryptjs";
import passport from "passport";
import session from "express-session";
import { pool } from "./config/db";
import passportStrategy from "./config/passport";
import connectPgSimple from "connect-pg-simple";

const pgSession: typeof connectPgSimple.PGStore =
  require("connect-pg-simple")(session);
require("dotenv").config();

interface RegisterRequest extends Request {
  body: {
    username: string;
    email: string;
    password: string;
  };
}

const schema = makeExecutableSchema({ typeDefs, resolvers });

const app = express();

app.use(express.json());

app.use(
  cors({
    origin: ["https://bug-tracker-red.vercel.app", "http://localhost:3000"],
    credentials: true,
  })
);
app.enable("trust proxy");
app.use(
  session({
    store: new pgSession({ pool: pool }),
    secret: process.env.SECRET!,
    resave: false,
    saveUninitialized: false,
    cookie: {
      maxAge: 1209600000,
      sameSite: "none",
      secure: true
    },
  })
);

app.use(passport.initialize());
app.use(passport.session());
passportStrategy(passport);

app.post("/login", (req, res, next) => {
  passport.authenticate("local", (err, user, info) => {
    if (err) throw err;
    if (!user) res.json(null);
    else {
      req.logIn(user, (err) => {
        if (err) return next(err);
        const { id, username, email, role } = req.user!;
        res.send({ id, username, email, role });     
      });
    }    
  })(req, res, next);
});

app.post("/register", async (req: RegisterRequest, res, next) => {
  const { username, email, password } = req.body;
  const hashedPassword = await bcrypt.hash(password, 10);

  try {
    const client = await pool.connect();
    const checkUser = await client.query(
      "SELECT * FROM users where email= $1 or username= $2",
      [email, username]
    );
    console.log(checkUser.rows[0]);
    if (checkUser.rows[0]) res.send({ message: "User already exists" });
    else {
      await client.query(
        "INSERT INTO users(username, email, password) VALUES($1, $2, $3);",
        [username, email, hashedPassword]
      );
      client.release();
      passport.authenticate("local", (err, user, info) => {
        if (err) throw err;
        if (!user) res.json(null);
        else {
          req.logIn(user, (err) => {
            if (err) return next(err);
            const { id, username, email, role } = req.user!;
            res.send({ id, username, email, role });
          });
        }
      })(req, res, next);
    }
  } catch (error) {
    res.send({ message: "An error has occurred" });
  }
});
app.post("/logout", (req, res, next) => {
  const sessionStore = req.sessionStore;
  sessionStore.destroy(req.sessionID, (error) => {
    if (error) {
      throw error;
    }
    req.logOut((err) => next(err));
    res.clearCookie("connect.sid");
    res.json({ success: true });
  });
});
app.get("/user", (req, res) => {
  if (req.user) {
    const { id, username, email, role } = req.user;
    res.send({ id, username, email, role });
  } else res.json(null);
});

app.use(
  "/graphql",
  graphqlHTTP((req: any) => {
    return {
      schema,
      graphiql: false,
      context: { user: req.user },
    };
  })
);

app.listen(process.env.PORT);
