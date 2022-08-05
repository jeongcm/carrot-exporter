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
    static tableIdService = new TableIdService();
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
                        logger.info(`===============${JSON.stringify(existingUser)}, accesss ===== ${accessToken}, rdredshhh== ${refreshToken}`)
                        if (existingUser) {
                            // existingUser['accesstoken'] = accessToken;
                             done(null, {...existingUser, accessToken});
                        } else {
                            logger.info(`party===============${JSON.stringify(profile)}`)
                            const customerAccount = await this.customerAccountService.createCustomerAccount({
                                customerAccountName: profile.displayName,
                                customerAccountDescription: '',
                                parentCustomerAccountId: '',
                                customerAccountType: 'IA'
                            }, req.systemId);
                            logger.info(`customerAccount===============${JSON.stringify(customerAccount)}`)
                            const customerAccountId: number = customerAccount.customerAccountKey || null;
                            const newPartyUser = await this.partyService.createUser({
                                email: profile.emails[0].value,
                                partyName: profile.displayName,
                                partyDescription: '',
                                parentPartyId: '',
                                firstName: profile.displayName,
                                lastName: profile.displayName,
                                userId: profile.emails[0].value,
                                mobile: '',
                                password: '',
                                customerAccountId,
                                partyUserStatus: 'AC',
                                socialProviderId: profile.id,
                            }, customerAccount.customerAccountKey, req?.systemId);
                            // newPartyUser['accesstoken'] = accessToken
                            logger.info(`newPartyUser===============${JSON.stringify(newPartyUser)}`)
                             done(null, {...newPartyUser, accessToken});
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