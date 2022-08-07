

import DB from '@/database';
import {Strategy} from 'passport-github';
import config from '@config/index';
import { logger } from '@/common/utils/logger';
import PartyService from '@/modules/Party/services/party.service';
import CustomerAccountService from '@/modules/CustomerAccount/services/customerAccount.service';

class Github {
  static partyUser = DB.PartyUser;
  static partyService = new PartyService();
  static customerAccountService = new CustomerAccountService();
  public static init(_passport: any): any {
    _passport.use(
      new Strategy(
        {
          clientID: config.socialKey.github.clientID,
          clientSecret: config.socialKey.github.clientSecret,
          callbackURL: config.socialKey.github.callbackUrl,
          scope: 'user:email',
          passReqToCallback: true,
        },
        async (req, accessToken, refreshToken, profile, done) => {
          try {
            
              const existingUser = await this.partyUser.findOne({ where: { socialProviderId: profile.id } });
              if (existingUser) {
                return done(null, existingUser);
              }else {
                logger.info(`in github login ${JSON.stringify(profile)}`)
                {
                  const customerAccount = await this.customerAccountService.createCustomerAccount({
                      customerAccountName: profile.displayName || profile.username,
                      customerAccountDescription: '',
                      parentCustomerAccountId: '',
                      customerAccountType: 'IA'
                  }, req.systemId);
                  const newPartyUser = await this.partyService.createUser({
                      email: "",
                      partyName: profile.displayName || profile.username,
                      partyDescription: '',
                      parentPartyId: '',
                      firstName: profile.displayName || profile.username,
                      lastName: profile.displayName || '',
                      userId: profile.username,
                      mobile: '',
                      password: '',
                      customerAccountId:customerAccount.customerAccountId,
                      partyUserStatus: 'AC'
                  }, customerAccount.customerAccountKey, '', profile.id);
                  done(null, newPartyUser);
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