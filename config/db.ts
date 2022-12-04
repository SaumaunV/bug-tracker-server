import { Client } from "pg";
require("dotenv").config();

export const client = new Client(process.env.DATABASE_URL);
