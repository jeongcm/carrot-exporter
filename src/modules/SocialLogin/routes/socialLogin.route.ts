import { Router } from 'express';
import passport from 'passport';
import config from '@config/index';
import jwt from 'jsonwebtoken';
import { Routes } from '@/common/interfaces/routes.interface';
import { IDataStoredInToken } from '@/common/interfaces/party.interface';

class SocialLoginRoutes implements Routes {
  public router = Router();

  constructor() {
    this.initializeRoutes();
  }

  private initializeRoutes() {
    this.router.get('/login/failed', (req, res) => {
      res.status(401).json({
        success: false,
        message: 'failure',
      });
    });

    this.router.get('/auth/google', passport.authenticate('google', { scope: ['profile', 'email'] }));

    this.router.get(
      '/auth/google/callback',
      passport.authenticate('google', {
        failureRedirect: '/login/failed',
      }),
      (req, res) => {
        const userString = JSON.stringify(req.user);
        const parsedJson = JSON.parse(userString);
        const dataStoredInToken: IDataStoredInToken = { partyUserKey: parsedJson.partyUserKey, customerAccountKey: 0 };
        const secretKey: string = config.auth.jwtSecretKey;
        const expiresIn: number = config.auth.authTokenExpirySecond; // 60 * 60;
        jwt.sign(dataStoredInToken, secretKey, { expiresIn }, (err, token) => {
          res.redirect(`${config.frontenAppUrl}/login?user=${JSON.stringify(req.user)}&access_token=${token}`);
        });
      },
    );
    // Google Auth: END

    // Github Auth: START
    this.router.get('/auth/github', passport.authenticate('github', { scope: ['user:email'] }));
    this.router.get(
      '/auth/github/callback',
      passport.authenticate('github', {
        failureRedirect: '/login/failed',
      }),
      (req, res) => {
        const userString = JSON.stringify(req.user);
        const parsedJson = JSON.parse(userString);
        const dataStoredInToken: IDataStoredInToken = { partyUserKey: parsedJson.partyUserKey, customerAccountKey: 0 };
        const secretKey: string = config.auth.jwtSecretKey;
        const expiresIn: number = config.auth.authTokenExpirySecond; // 60 * 60;
        jwt.sign(dataStoredInToken, secretKey, { expiresIn }, (err, token) => {
          res.redirect(`${config.frontenAppUrl}/login?user=${JSON.stringify(req.user)}&access_token=${token}`);
        });
      },
    );
    // Github Auth: END
  }
}

export default SocialLoginRoutes;
