import { SocialLoginEnum } from '@/common/enums';
import { logger } from '@/common/utils/logger';

class SocialLoginController {
  /**
   * return a uniform login success callback
   *
   * @param  {SocialLoginEnum} type
   * @returns any
   */
  public static loginSuccessCallback(type: SocialLoginEnum): any {
    logger.info(`loginSuccessCallback=============================${type}`)

    return (req, res, next): any => {
      logger.info(`type=============================${type}`)
      // return res.redirect('/login')
      return res.status(200).json({
        ok: true,
        msg: 'successfully login',
        type,
      });
    };
  }
}

export default SocialLoginController;