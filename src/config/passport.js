const LocalStrategy = require('passport-local').Strategy;
const bcrypt = require('bcrypt');
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

function initialize(passport) {
  passport.use(
    new LocalStrategy({ usernameField: 'email' }, async (email, password, done) => {
      try {
        const user = await prisma.users.findUnique({
          where: { email },
        });

        if (!user) {
          return done(null, false, { message: 'No user with that email' });
        }

        const isMatch = await bcrypt.compare(password, user.password_hash);

        if (!isMatch) {
          return done(null, false, { message: 'Incorrect password' });
        }

        return done(null, user);
      } catch (err) {
        return done(err);
      }
    })
  );

  // Serialize by user ID (used for session handling)
  passport.serializeUser((user, done) => {
    done(null, user.user_id);
  });

  // Deserialize user from session
  passport.deserializeUser(async (id, done) => {
    try {
      const user = await prisma.users.findUnique({
        where: { user_id: id },
        include: {
          user_favourites: true, // this includes related favourites
        },
      });

      done(null, user);
    } catch (err) {
      done(err);
    }
  });

}

module.exports = initialize;