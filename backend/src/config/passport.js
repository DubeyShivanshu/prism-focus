import passport from 'passport'
import { Strategy as GoogleStrategy } from 'passport-google-oauth20'
import { env } from './env.js'

export function configurePassport() {
  if (!env.GOOGLE_CLIENT_ID || !env.GOOGLE_CLIENT_SECRET) {
    console.warn('[Passport] GOOGLE_CLIENT_ID not set — Google OAuth disabled')
    return
  }

  passport.use(
    new GoogleStrategy(
      {
        clientID:     env.GOOGLE_CLIENT_ID,
        clientSecret: env.GOOGLE_CLIENT_SECRET,
        callbackURL:  env.GOOGLE_CALLBACK_URL,
      },
      // Verify callback — passport passes the Google profile here
      (accessToken, refreshToken, profile, done) => {
        // Pass raw profile to controller via done()
        return done(null, profile)
      }
    )
  )

  // Minimal session serialization (we use JWT, so session is not needed)
  passport.serializeUser((user, done)   => done(null, user))
  passport.deserializeUser((user, done) => done(null, user))

  console.log('[Passport] Google OAuth strategy configured ✓')
}
