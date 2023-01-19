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
const bcryptjs_1 = __importDefault(require("bcryptjs"));
const passport_local_1 = __importDefault(require("passport-local"));
const db_1 = require("./db");
function default_1(passport) {
    passport.use(new passport_local_1.default.Strategy((username, password, done) => __awaiter(this, void 0, void 0, function* () {
        db_1.pool.query('select * from users where username = $1', [username], (err, result) => {
            const user = result.rows[0];
            if (err)
                throw err;
            if (!user)
                return done(null, false);
            bcryptjs_1.default.compare(password, user.password, (err, result) => {
                if (err)
                    throw err;
                if (result === true)
                    return done(null, user);
                else
                    return done(null, false);
            });
        });
    })));
    passport.serializeUser((user, done) => {
        done(null, user.id);
    });
    passport.deserializeUser((id, done) => {
        db_1.pool.query('select * from users where id = $1', [id], (err, result) => {
            done(err, result.rows[0]);
        });
    });
}
exports.default = default_1;
;
