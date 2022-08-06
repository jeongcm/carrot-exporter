/**
 * Defines the passport config
 *
 */

 import { Application } from 'express';
 import passport from 'passport';
 import DB from '@/database';
 
 import GoogleStrategy from '../services/google.service';
 import GithubStrategy from '../services/github.service';
import { logger } from '@/common/utils/logger';

 
 class Passport {
     
   public mountPackage(_express: Application): Application {
     _express = _express.use(passport.initialize());
     _express = _express.use(passport.session());
 
     passport.serializeUser<any, any>((user:any, done: any) => {
       logger.info(`user in serialize`, user)
       done(null, user);
     });
 
     passport.deserializeUser<any, any>((id:string, done: any) => {
       logger.info(`id in deserialize`, id)
       const user = DB.PartyUser.findOne({ where: { socialProviderId:id } });
       logger.info(`user in deserialize`, user)
       done(null, user);
     });
 
     this.mountLocalStrategies();
 
     return _express;
   }
 
   public mountLocalStrategies(): void {
     try {
       GoogleStrategy.init(passport);
       GithubStrategy.init(passport);
     } catch (_err) {
       console.log('err', _err.stack);
     }
   }
 
   public isAuthenticated(req, res, next): any {
     if (req.isAuthenticated()) {
       return next();
     }
 
     //  req.flash('errors', { msg: 'Please Log-In to access any further!'});
     return res.redirect('/login');
   }
 
   public isAuthorized(req, res, next): any {
     const provider = req.path.split('/').slice(-1)[0];
     const token = req.user.tokens.find(token => token.kind === provider);
     if (token) {
       return next();
     } else {
       return res.redirect(`/auth/${provider}`);
     }
   }
 }
 
 export default new Passport();