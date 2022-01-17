/**
 * Define Github OAuth2
 */

import DB from 'databases';
import { Strategy } from 'passport-github';
class Github {
  public static init(_passport: any): any {
    _passport.use(
      new Strategy(
        {
          clientID: '69029aa26fcbc11e176f',
          clientSecret: '10c6618a2cc103441c603798b083e1b1f0666965',
          callbackURL: 'http://localhost:5000/auth/github/callback',
          passReqToCallback: true,
        },
        async (req, accessToken, refreshToken, profile, done) => {
          try {
            if (req.user) {
              const existingUser = await DB.Users.findOne({ where: { socialProviderId: profile.id } });
              if (existingUser) {
                req.flash('error', {
                  msg: 'There is already a Github account that belongs to you. Sign in with that account or delete it, then link it with your current account.',
                });
                return done(null, existingUser);
              } else {
                const user = await DB.Users.findOne({ where: { id: req.user.id } });

                user.socialProviderId = profile.id;
                user.token = accessToken;
                user.firstName = user.firstName || profile.displayName;
                if (profile.photos) {
                  user.photo = user.photo || profile.photos[0].value;
                }

                await DB.Users.create(user);
              }
            } else {
              const existingUser = await DB.Users.findOne({ where: { socialProviderId: profile.id } });
              if (existingUser) {
                return done(null, existingUser);
              }
              const existingEmailUser = DB.Users.findOne({ where: { email: profile.emails[0].value } });
              if (existingEmailUser) {
                req.flash('error', {
                  msg: 'There is already an account using this email address. Sing in to that accoount and link it with Github manually from Account Settings.',
                });
              } else {
                const user = new DB.Users();

                user.email = profile.emails[0].value;
                user.socialProviderId = profile.id;
                user.token = accessToken;
                user.firstName = user.firstName || profile.displayName;
                if (profile.photos) {
                  user.photo = user.photo || profile.photos[0].value;
                }
                const newUser = await DB.Users.create(user);
                return done(null, newUser);
              }
            }
          } catch (err) {
            return done(err);
          }
        },
      ),
    );
  }
}

export default Github;
