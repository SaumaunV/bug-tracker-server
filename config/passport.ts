import bcrypt from'bcryptjs';
import { PassportStatic } from 'passport';
import localStrategy from 'passport-local';
import { QueryResult } from 'pg';
import { pool } from './db';

declare global {
  namespace Express {
    interface User {
      username: string;
      email: string;
      role: string;
      id?: string;
    }
  }
}


export default function(passport: PassportStatic) {

    passport.use(new localStrategy.Strategy( async (username, password, done) => {
        pool.query('select * from users where username = $1', [username], (err, result) => {
            const user = result.rows[0];
            if(err) throw err;
            if(!user) return done(null, false);
            bcrypt.compare(password, user.password, (err, result) => {
                if(err) throw err;
                if(result === true) return done(null, user);
                else return done(null, false);
            });
        });
    }));

    passport.serializeUser((user, done) => {
        done(null, user.id);
    });
    passport.deserializeUser((id: string, done) => {
        pool.query('select * from users where id = $1', [id], (err, result) => {
            done(err, result.rows[0]);
        })
    })
};