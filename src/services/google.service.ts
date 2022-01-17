// /**
//  * Define Google OAuth2
//  */

import DB from 'databases';
import { Strategy } from 'passport-google-oauth20';
class Google {
  public static init(_passport: any): any {
    _passport.use(
      new Strategy(
        {
          clientID: '627676733827-n53n7a4s5u2acqu9etr2ld3pprgqn6rh.apps.googleusercontent.com',
          clientSecret: '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',
          callbackURL: 'http://localhost:5000/auth/google/callback',
          passReqToCallback: true,
        },
        async (req, accessToken, refreshToken, profile, done) => {
          try{

            if (req.user) {
              const existingUser = await DB.Users.findOne({ where:{socialProviderId: profile.id }})
                if (existingUser) {
                  console.log("in next")
                  req.flash('error',{
                    msg: 'There is already a Google account that belongs to you. Sign in with that account or delete it, then link it with your current account.',
                  });
                  return done(null, existingUser)
                } else {
                  const user = await DB.Users.findOne({where:{id:req.user.id}})
  
                    user.socialProviderId = profile.id;
                    user.token =  accessToken;                  
                    user.firstName = user.firstName || profile.displayName;
                    if (profile.photos) {
                      user.photo = user.photo || profile.photos[0].value;
                    }
                    await DB.Users.create(user);
                  }
                
            } else {
              const existingUser = await DB.Users.findOne({ where:{socialProviderId: profile.id}})
              if (existingUser) {
                  return done(null, existingUser);
                }
                const existingEmailUser = DB.Users.findOne({ where:{email: profile.emails[0].value }})
                  if (existingEmailUser) {
                    req.flash('error', {
                      msg: 'There is already an account using this email address. Sing in to that accoount and link it with Google manually from Account Settings.',
                    });
                  } else {
                    const user = new DB.Users();
  
                    user.email = profile.emails[0].value;
                    user.socialProviderId = profile.id;
                    user.token =  accessToken;
                    user.firstName = user.firstName || profile.displayName;
                    if (profile.photos) {
                      user.photo = user.photo || profile.photos[0].value;
                    }
                    console.log("user created", user)
  
                    const newUser = await DB.Users.create(user);
                    return done(null, newUser);
                  }
            }
          }catch(err){
                return done(err);
          }
        },
      ),
    );
  }
}

export default Google;
