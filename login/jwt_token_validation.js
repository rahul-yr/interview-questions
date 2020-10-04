var passport = require('passport');
const JwtStrategy = require('passport-jwt').Strategy;
const { ExtractJwt } = require('passport-jwt');

// User defined imports
const { SECRET } = require("../config");
const User = require("./models");

// JSON WEB TOKENS STRATEGY
passport.use(new JwtStrategy({
    jwtFromRequest: ExtractJwt.fromHeader('authorization'),
    secretOrKey: SECRET
  }, async (payload, done) => {
    try {
      // Find the user specified in token
      const user = await User.findById(payload.user_id);
      // If user doesn't exists, handle it
      if (!user) {
        done(null, false);
      }
      // Otherwise, return the user
      if(user.role === payload.type && user.method === payload.method && user.google.email === payload.email){
        if(user.role === 'user'){
            return done(null, user);
        }else{
          if(user.access === 'yes'){
              return done(null, user);
          }
        }
      }

      done(null, false);

    } catch(error) {
      done(error, false);
    }
  }));