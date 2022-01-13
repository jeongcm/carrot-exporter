/**
 * Define Google OAuth2
 */

import DB from 'databases';
const passport = require('passport');
const GoogleStrategy = require('passport-google-oauth').OAuth2Strategy;

passport.use(
  new GoogleStrategy(
    {
      clientID: '627676733827-n53n7a4s5u2acqu9etr2ld3pprgqn6rh.apps.googleusercontent.com',
      clientSecret: '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',
      callbackURL: 'http://127.0.0.1:5000/google/callback',
    },
    async function (accessToken, refreshToken, profile, done) {
      const [user, status] = await DB.Users.findOrCreate({
        where: {
          google: profile.id,
          username: profile.displayName,
          photo: profile.photos[0].value,
          lastAccess: new Date(),
          token:accessToken,
          password: profile.displayName,
        },
      });
      done(null, user);
    },
  ),
);
passport.use(
  new GitHubStrategy({
    clientID: "e7b10decd2ed4ef13816",
    clientSecret: "bb073a53914d014f328de98ad9fe5a3cff366912",
    callbackURL: "http://127.0.0.1:3000/github/callback"
  },
    async function (accessToken, refreshToken, profile, done) {
      const [user, status] = await DB.Users.findOrCreate({
        where: {
          google: profile.id,
          username: profile.displayName,
          photo: profile.photos[0].value,
          lastAccess: new Date(),
          token:accessToken,
          password: profile.displayName,
        },
      });
      done(null, user);
    },
  ),
);

export default passport;
