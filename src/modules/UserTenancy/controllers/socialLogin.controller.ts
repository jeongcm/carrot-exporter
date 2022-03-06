/**
 * Handle all your social auth routes
 */
/*
RYAN:
1. the class name Social is not explicit enough. changed to SocialLogin
2. add SocialLogin Enum
*/
import { SocialLoginEnum } from '@/common/enums';

class SocialLogin {
  /**
   * return a uniform login success callback
   *
   * @param  {SocialLoginEnum} type
   * @returns any
   */
  public static loginSuccessCallback(type: SocialLoginEnum): any {
    return (req, res, next): any => {
      return res.status(200).json({
        ok: true,
        msg: 'successfully login',
        type,
      });
    };
  }
}

export default SocialLogin;
