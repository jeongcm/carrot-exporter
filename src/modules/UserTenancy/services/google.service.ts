// /**
//  * Define Google OAuth2
//  */

import DB from '@/database';
import config from 'config';
import { Strategy } from 'passport-google-oauth20';
class Google {
  public static init(_passport: any): any {
    _passport.use(
      new Strategy(
        {
          clientID: config.socialKey.google.clientID,
          clientSecret: config.socialKey.google.clientSecret,
          callbackURL: config.socialKey.google.callbackURL,
          passReqToCallback: true,
        },
        async (req, accessToken, refreshToken, profile, done) => {
          try {
            if (req.user) {
              const existingUser = await DB.Users.findOne({ where: { socialProviderId: profile.id } });
              if (existingUser) {
                req.flash('error', {
                  msg: 'There is already a Google account that belongs to you. Sign in with that account or delete it, then link it with your current account.',
                });
                return done(null, profile);
              } else {
                const user = await DB.Users.findOne({ where: { id: req.user.id } });
                (user.email = profile.emails[0].value), (user.socialProviderId = profile.id);
                user.token = accessToken;
                user.firstName = user.firstName || profile.displayName;
                user.username = user.username || profile.displayName;
                if (profile.photos) {
                  user.photo = user.photo || profile.photos[0].value;
                }
                await DB.Users.create(user);
              }
            } else {
              const existingUser = await DB.Users.findOne({ where: { socialProviderId: profile.id } });
              if (existingUser) {
                return done(null, profile);
              }
              const existingEmailUser = await DB.Users.findOne({ where: { email: profile.emails[0].value } });
              if (existingEmailUser) {
                req.flash('error', {
                  msg: 'There is already an account using this email address. Sing in to that accoount and link it with Google manually from Account Settings.',
                });
              } else {
                const user = {
                  email: profile.emails[0].value,
                  socialProviderId: profile.id,
                  token: accessToken,
                  firstName: profile.displayName,
                  username: profile.displayName,
                };
                if (profile.photos) {
                  user['photo'] = profile.photos[0].value;
                }
                await DB.Users.create(user);
                return done(null, profile);
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

export default Google;
