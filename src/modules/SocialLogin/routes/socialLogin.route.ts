import { Router } from 'express';
import  passport from 'passport';
import { Routes } from '@/common/interfaces/routes.interface';
import { SocialLoginEnum } from '@/common/enums';
import SocialLoginController from '../controllers/socialLogin.controller';
import systemAuthMiddleware from '@/modules/ApiGateway/middlewares/systemAuth.middleware';
import { logger } from '@/common/utils/logger';

class SocialLoginRoutes implements Routes {
  public router = Router();
  public CLIENT_URL = "http://localhost:3000/cluster/dashboard/list"
  constructor() {
    this.initializeRoutes();
  }

  private initializeRoutes() {
    this.router.get("/auth/login/success", (req, res) => {
      logger.info(`req.user=======================${JSON.stringify(req.user)}`)
      if (req.user) {
        res.status(200).json({
          success: true,
          message: "successfull",
          user: req.user,
          //   cookies: req.cookies
        });
      }else{
        res.status(200).json({
          success: true,
          message: "successfull",
          user: req.user,
          //   cookies: req.cookies
        });
      }
    });

    this.router.get("/login/failed", (req, res) => {
      res.status(401).json({
        success: false,
        message: "failure",
      });
    });
    
    this.router.get("/logout", (req, res) => {
      req.logout();
      res.redirect(this.CLIENT_URL);
    });
    
    this.router.get("/auth/google", passport.authenticate("google", { scope: ["profile", "email"] }));
    
    this.router.get(
      "/auth/google/callback",
      passport.authenticate("google", {
        // successRedirect: this.CLIENT_URL,
        failureRedirect: "/login/failed",
      }), (req, res)=>{
        logger.info(`req-----------${JSON.stringify(req.user)}`);
        logger.info(`res-----------${JSON.stringify(res)}`);
        res.status(200).json({
          success: true,
          message: "successfull",
          user: JSON.stringify(res),
          //   cookies: req.cookies
        });
      }
    );
    // Google Auth: END

    // Github Auth: START
    this.router.get('/auth/github', systemAuthMiddleware, passport.authenticate('github', { scope: ['user:email'] }));
    this.router.get(
      '/auth/github/callback',systemAuthMiddleware,
      passport.authenticate('github', { failureRedirect: '/login' }),
      SocialLoginController.loginSuccessCallback(SocialLoginEnum.GITHUB),
    );
    // Github Auth: END
  }
}

export default SocialLoginRoutes;
