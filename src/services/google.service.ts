/**
 * Define Google OAuth2
 */

import DB from 'databases';
const User = require('../models/users.model')['User'];
import UserService from '@services/users.service';

var passport = require('passport');
var GoogleStrategy = require('passport-google-oauth').OAuth2Strategy;

passport.use(
  new GoogleStrategy(
    {
      clientID: '627676733827-n53n7a4s5u2acqu9etr2ld3pprgqn6rh.apps.googleusercontent.com',
      clientSecret: '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',
      callbackURL: 'http://127.0.0.1:5000/google/callback',
    },
    async function (accessToken, refreshToken, profile, done) {
      console.log('USER=======================', User, profile);
      const [user, status] = await DB.Users.findOrCreate({
        where: {
          google: profile.id,
          username: profile.displayName,
          photo: profile.photos[0].value,
          lastAccess: new Date(),
          // email:
          password: profile.displayName,
        },
      });
      console.log('user created', user);
      done(null, user);
    },
  ),
);
//   }
// }

export default passport;
