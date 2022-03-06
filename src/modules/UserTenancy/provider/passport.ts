/**
 * Defines the passport config
 *
 */

import { Application } from 'express';
import passport from 'passport';
import DB from '@/database';

//  import LocalStrategy from '../services/strategies/Local';
import GoogleStrategy from '../services/google.service';
import GithubStrategy from '../services/github.services';
//  import TwitterStrategy from '../services/strategies/Twitter';

//  import User from '../models/User';
//  import Log from '../middlewares/Log';

class Passport {
  public mountPackage(_express: Application): Application {
    _express = _express.use(passport.initialize());
    _express = _express.use(passport.session());

    passport.serializeUser<any, any>((user, done) => {
      done(null, user.id);
    });

    passport.deserializeUser<any, any>((id, done) => {
      const user = DB.Users.findOne({ where: { id } });
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
