import express from "express";
import { graphqlHTTP } from "express-graphql";
import { makeExecutableSchema } from "@graphql-tools/schema";
import { typeDefs } from './schema/type-defs';
import { resolvers } from "./schema/resolvers";
import cors from 'cors';

const schema = makeExecutableSchema({ typeDefs, resolvers });

const app = express();

app.use(cors());

app.use(
  "/graphql",
  graphqlHTTP({
    schema,
    graphiql: false,
  })
);
app.listen(4000);
