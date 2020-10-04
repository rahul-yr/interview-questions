const passport = require('passport');

const passportJWT = passport.authenticate('jwt', { session: false });

module.exports = {
    passportJWT
}

