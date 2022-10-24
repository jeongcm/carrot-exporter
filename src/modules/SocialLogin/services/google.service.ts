import { logger } from '@/common/utils/logger';
import DB from '@/database';
import config from '@config/index';
import { Strategy } from 'passport-google-oauth20';
import TableIdService from '@/modules/CommonService/services/tableId.service';
import { IResponseIssueTableIdDto } from '@/modules/CommonService/dtos/tableId.dto';
import PartyService from '@/modules/Party/services/party.service';
import CustomerAccountService from '@/modules/CustomerAccount/services/customerAccount.service';

class Google {
  static partyUser = DB.PartyUser;
  static partyService = new PartyService();
  static customerAccountService = new CustomerAccountService();
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
            const existingUser = await this.partyUser.findOne({ where: { socialProviderId: profile.id } });
            if (existingUser) {
              done(null, existingUser);
            } else {
              //set customerAccount Api Key
              const uuid = require('uuid');
              const apiKey = uuid.v1();
              const apiBuff = Buffer.from(apiKey);
              const encodedApiKey = apiBuff.toString('base64');

              const customerAccount = await this.customerAccountService.createCustomerAccount(
                {
                  customerAccountName: profile.displayName,
                  customerAccountDescription: '',
                  parentCustomerAccountId: '',
                  customerAccountType: 'IA',
                  firstName: profile.displayName,
                  lastName: profile.displayName,
                  email: profile.emails[0].value,
                  customerAccountApiKey: encodedApiKey,
                  customerAccountApiKeyIssuedAt: new Date(),
                },
                req.systemId,
              );
              const newPartyUser = await this.partyService.createUser(
                {
                  email: profile.emails[0].value,
                  timezone: '',
                  partyName: profile.displayName,
                  partyDescription: '',
                  parentPartyId: '',
                  firstName: profile.displayName,
                  lastName: profile.displayName,
                  userId: profile.emails[0].value,
                  mobile: '',
                  password: '',
                  adminYn: false,
                  customerAccountId: customerAccount.customerAccountId,
                  partyUserStatus: 'AC',
                  language: 'EN',
                },
                customerAccount.customerAccountKey,
                '',
                profile.id,
              );
              done(null, newPartyUser);
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
