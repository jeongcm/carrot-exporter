/**
 * Define Github OAuth2
 */

 import DB from 'databases';
 const passport = require('passport');
 const GitHubStrategy = require('passport-github').Strategy;
 
 passport.use(
   new GitHubStrategy({
     clientID: "69029aa26fcbc11e176f",
     clientSecret: "10c6618a2cc103441c603798b083e1b1f0666965",
     callbackURL: "http://localhost:5000/github/callback"
   },
     async function (accessToken, refreshToken, profile, done) {
       const [user, status] = await DB.Users.findOrCreate({
         where: {
           google: profile.id,
           username: profile.displayName,
           photo: profile.photos[0].value,
           lastAccess: new Date(),
           token:accessToken,
           password: profile.displayName,
         },
       });
       done(null, user);
     },
   ),
 );
 
 export default passport;
 