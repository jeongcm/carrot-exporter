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
                        if (req.user) {
                            const existingUser = await this.partyUser.findOne({ where: { socialProviderId: profile.id } });
                            if (existingUser) {
                                logger.info(`existingUser11111=============================${existingUser}`)
                                return done(400, { msg: 'There is already an account using this email address. Sing in to that accoount and link it with Google manually from Account Settings.' })

                                // req.flash('error', {
                                //     msg: 'There is already a Google account that belongs to you. Sign in with that account or delete it, then link it with your current account.',
                                // });
                                return done(null, profile);
                            } else {
                                logger.info(`party===============${profile}`)
                                const customerAccount = await this.customerAccountService.createCustomerAccount({
                                    customerAccountName: profile.displayName,
                                    customerAccountDescription: '',
                                    parentCustomerAccountId: '',
                                    customerAccountType: 'IA'
                                }, req.systemId);
                                const  customerAccountId : number =  customerAccount.customerAccountKey || null;
                                const partyUserCreated = await this.partyService.createUser({
                                    email:profile.emails[0].value,
                                    partyName: profile.displayName,
                                    partyDescription: '',
                                    parentPartyId: '',
                                    firstName: profile.name.givenName,
                                    lastName:profile.name.familyName,
                                    userId: profile.emails[0].value,
                                    mobile: '',
                                    password: '',
                                    socialProviderId: profile.id,
                                    customerAccountId,
                                    partyUserStatus: 'AC'
                                }, customerAccount.customerAccountKey, req?.systemId)
                                logger.info(`partyUserCreated===============${JSON.stringify(partyUserCreated)}`)
                                // const responseTableIdData: IResponseIssueTableIdDto = await this.tableIdService.issueTableId("PartyUser");
                                // const user = await this.partyUser.findOne({ where: { partyUserId: req.user.id } });
                                // user.email = profile.emails[0].value;
                                // user.socialProviderId = profile.id;
                                // user.token = accessToken;
                                // user.firstName = user.firstName || profile.displayName;
                                // user.partyUserId = user.userId || profile.displayName;
                                // user.partyUserKey = responseTableIdData.tableIdFinalIssued || null
                                // // if (profile.photos) {
                                // //     user.photo = user.photo || profile.photos[0].value;
                                // // }
                                // await this.partyUser.create(user);
                                return done(null, partyUserCreated);
                            }
                        } else {
                            const existingUser = await this.partyUser.findOne({ where: { socialProviderId: profile.id } });
                            if (existingUser) {
                                return done(null, profile);
                            }
                            const existingEmailUser = await this.partyUser.findOne({ where: { email: profile.emails[0].value } });
                            if (existingEmailUser) {
                                logger.info(`existingUser22222222=============================${existingEmailUser}`)
                                return done(400, { msg: 'There is already an account using this email address. Sing in to that accoount and link it with Google manually from Account Settings.' })
                                // req.flash('error', {
                                //     msg: 'There is already an account using this email address. Sing in to that accoount and link it with Google manually from Account Settings.',
                                // });
                            } else {
                                logger.info(`party===============${JSON.stringify(profile)}`)
                                const customerAccount = await this.customerAccountService.createCustomerAccount({
                                    customerAccountName: profile.displayName,
                                    customerAccountDescription: '',
                                    parentCustomerAccountId: '',
                                    customerAccountType: 'IA'
                                }, req.systemId);
                                logger.info(`customerAccount===============${JSON.stringify(customerAccount)}`)
                                const  customerAccountId : number =  customerAccount.customerAccountKey || null;
                                const newPartyUser = await this.partyService.createUser({
                                    email:profile.emails[0].value,
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
                                }, customerAccount.customerAccountKey, req?.systemId)
                                return done(null, newPartyUser);
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