require('dotenv').config();
const JwtStrategy = require('passport-jwt').Strategy;
const ExtractJwt = require('passport-jwt').ExtractJwt;
const LinkedInStrategy = require('passport-linkedin-oauth2').Strategy;
const User = require('../models/User');
const { logger } = require('../utils/logger');


module.exports = (passport) => {
  // JWT Strategy for token authentication
  const jwtOptions = {
    jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
    secretOrKey: process.env.JWT_SECRET
  };

  passport.use(
    new JwtStrategy(jwtOptions, async (payload, done) => {
      try {
        const user = await User.findById(payload.id);
        if (user) {
          return done(null, user);
        }
        return done(null, false);
      } catch (err) {
        logger.error('Error in JWT strategy:', err);
        return done(err, false);
      }
    })
  );

  // LinkedIn OAuth Strategy
  if (process.env.LINKEDIN_CLIENT_ID && process.env.LINKEDIN_CLIENT_SECRET) {
    passport.use(
      new LinkedInStrategy(
        {
          clientID: process.env.LINKEDIN_CLIENT_ID,
          clientSecret: process.env.LINKEDIN_CLIENT_SECRET,
          callbackURL: process.env.LINKEDIN_CALLBACK_URL,
          scope: ['r_emailaddress', 'r_liteprofile', 'w_member_social'],
          state: true
        },
        async (accessToken, refreshToken, profile, done) => {
          try {
            // Check if user already exists
            let user = await User.findOne({ 'linkedin.id': profile.id });

            if (user) {
              // Update LinkedIn tokens
              user.linkedin.accessToken = accessToken;
              user.linkedin.refreshToken = refreshToken;
              await user.save();
              return done(null, user);
            }

            // Create new user if doesn't exist
            user = new User({
              email: profile.emails[0].value,
              name: `${profile.name.givenName} ${profile.name.familyName}`,
              linkedin: {
                id: profile.id,
                accessToken,
                refreshToken,
                profile: profile._json
              }
            });

            await user.save();
            return done(null, user);
          } catch (err) {
            logger.error('Error in LinkedIn strategy:', err);
            return done(err, false);
          }
        }
      )
    );
  } else {
    logger.warn('LinkedIn OAuth credentials not provided. LinkedIn authentication will not work.');
  }
};