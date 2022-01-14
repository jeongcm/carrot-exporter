/**
 * Define Google OAuth2
 */

import DB from 'databases';
import passport from 'passport';
import passportGoogle from 'passport-google-oauth';
const GoogleStrategy = passportGoogle.OAuth2Strategy
console.log("passport=======================", passport)
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

export default passport;
