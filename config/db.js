"use strict";
exports.__esModule = true;
exports.pool = void 0;
var pg_1 = require("pg");
require("dotenv").config();
exports.pool = new pg_1.Pool({
    connectionString: process.env.DATABASE_URL
});
