import { BearerStrategy } from 'passport-azure-ad';
import passport from 'passport';

const options = {
  identityMetadata: `https://login.microsoftonline.com/${process.env.AZURE_TENANT_ID}/v2.0/.well-known/openid-configuration`,
  clientID: process.env.AZURE_CLIENT_ID!,
  issuer: `https://login.microsoftonline.com/${process.env.AZURE_TENANT_ID}/v2.0`,
  audience: process.env.AZURE_CLIENT_ID!,
  loggingLevel: 'info' as any,
  passReqToCallback: false,
  validateIssuer: false
};

const bearerStrategy = new BearerStrategy(options, (token: any, done: any) => {
  // The token payload is passed here if verification succeeds
  if (!token.oid) {
    done(new Error('oid is not found in token'));
  } else {
    done(null, token);
  }
});

passport.use(bearerStrategy);

export const authenticateAzureAD = passport.authenticate('oauth-bearer', { session: false });
