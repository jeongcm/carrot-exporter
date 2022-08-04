

import DB from '@/database';
import {Strategy} from 'passport-github';
import config from '@config/index';
import { logger } from '@/common/utils/logger';

class Github {
  static partyUser = DB.PartyUser;
  public static init(_passport: any): any {
    _passport.use(
      new Strategy(
        {
          clientID: config.socialKey.github.clientID,
          clientSecret: config.socialKey.github.clientSecret,
          callbackURL: config.socialKey.github.callbackUrl,
          passReqToCallback: true,
        },
        async (req, accessToken, refreshToken, profile, done) => {
          try {
            if (req.user) {
              const existingUser = await this.partyUser.findOne({ where: { socialProviderId: profile.id } });
              if (existingUser) {
                logger.info(`existingUser=============================${existingUser}`)
                req.flash('error', {
                  msg: 'There is already a Github account that belongs to you. Sign in with that account or delete it, then link it with your current account.',
                });
                return done(null, existingUser);
              } else {
                const user = await this.partyUser.findOne({ where: { partyUserId: req.user.id } });

                user.socialProviderId = profile.id;
                user.token = accessToken;
                user.firstName = user.firstName || profile.displayName;
                // if (profile.photos) {
                //   user.photo = user.photo || profile.photos[0].value;
                // }

                await this.partyUser.create(user);
              }
            } else {
              const existingUser = await this.partyUser.findOne({ where: { socialProviderId: profile.id } });
              if (existingUser) {
                logger.info(`existingUser=============================${existingUser}`)
                return done(null, existingUser);
              }
              const existingEmailUser = this.partyUser.findOne({ where: { email: profile.emails[0].value } });
              if (existingEmailUser) {
                req.flash('error', {
                  msg: 'There is already an account using this email address. Sing in to that accoount and link it with Github manually from Account Settings.',
                });
              } else {
                const user = new this.partyUser();
                user.email = profile.emails[0].value;
                user.socialProviderId = profile.id;
                user.token = accessToken;
                user.firstName = user.firstName || profile.displayName;
                // if (profile.photos) {
                //   user.photo = user.photo || profile.photos[0].value;
                // }
                const newUser = await this.partyUser.create(user);
                return done(null, newUser);
              }
            }
          } catch (err) {
            console.log(err);
          }
        },
      ),
    );
  }
}

export default Github;