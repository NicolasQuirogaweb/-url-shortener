import passport from 'passport';
import { Strategy as GoogleStrategy } from 'passport-google-oauth20';
import { env } from './env';
import { authRepository } from '../modules/auth/auth.repository';

if (env.GOOGLE_CLIENT_ID && env.GOOGLE_CLIENT_SECRET && env.GOOGLE_CALLBACK_URL) {
  passport.use(
    new GoogleStrategy(
      {
        clientID: env.GOOGLE_CLIENT_ID,
        clientSecret: env.GOOGLE_CLIENT_SECRET,
        callbackURL: env.GOOGLE_CALLBACK_URL,
      },
      async (_accessToken, _refreshToken, profile, done) => {
        try {
          const email = profile.emails?.[0]?.value;
          if (!email) {
            return done(new Error('No email found in Google profile'), undefined);
          }

          let user = await authRepository.findByGoogleId(profile.id);
          if (!user) {
            user = await authRepository.findByEmail(email);
            if (user) {
              await authRepository.linkGoogle(user._id.toString(), profile.id);
            } else {
              user = await authRepository.createFromGoogle(email, profile.id);
            }
          }

          return done(null, { userId: user._id.toString(), email: user.email });
        } catch (err) {
          return done(err, undefined);
        }
      },
    ),
  );
}

export default passport;
