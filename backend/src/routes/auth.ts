import express from 'express';
import passport from 'passport';
import { OIDCStrategy } from 'passport-azure-ad';
import jwt from 'jsonwebtoken';
import { PrismaClient } from '@prisma/client';

const router = express.Router();
const prisma = new PrismaClient();

// Azure AD Strategy configuration
const azureAdStrategy = new OIDCStrategy({
  identityMetadata: `https://login.microsoftonline.com/${process.env.AZURE_TENANT_ID}/.well-known/openid-configuration`,
  clientID: process.env.AZURE_CLIENT_ID!,
  responseType: 'code',
  responseMode: 'query',
  redirectUrl: process.env.AZURE_REDIRECT_URI || 'http://localhost:3000',
  allowHttpForRedirectUrl: process.env.NODE_ENV === 'development',
  clientSecret: process.env.AZURE_CLIENT_SECRET,
  validateIssuer: true,
  isB2C: false,
  issuer: `https://sts.windows.net/${process.env.AZURE_TENANT_ID}/`,
  passReqToCallback: false,
  scope: ['email', 'profile']
}, async (iss: any, sub: any, profile: any, accessToken: any, refreshToken: any, done: any) => {
  try {
    // Extract user information from Azure AD profile
    const email = profile.upn || profile.email;
    const name = profile.displayName || profile.name;
    
    if (!email) {
      return done(new Error('Email not found in Azure AD profile'), null);
    }

    // Check if user exists in database
    let user = await prisma.user.findUnique({
      where: { email }
    });

    // Create user if doesn't exist
    if (!user) {
      user = await prisma.user.create({
        data: {
          email,
          name,
          department: 'General', // Default department
          role: 'USER'
        }
      });
    }

    // Generate JWT token
    const token = jwt.sign(
      { 
        userId: user.id, 
        email: user.email, 
        role: user.role 
      },
      process.env.JWT_SECRET!,
      { expiresIn: '24h' }
    );

    return done(null, { user, token });
  } catch (error) {
    return done(error, null);
  }
});

passport.use(azureAdStrategy);

// Serialize/deserialize user for passport
passport.serializeUser((user: any, done) => done(null, user));
passport.deserializeUser((user: any, done) => done(null, user));

// Auth endpoints
router.get('/azure', passport.authenticate(azureAdStrategy, {
  failureRedirect: '/login?error=true'
}), (req, res) => {
  // This will be handled by the frontend redirect
  res.redirect('/dashboard');
});

router.post('/azure/callback', passport.authenticate(azureAdStrategy), (req, res) => {
  const user = req.user as any;
  res.json({
    user: user.user,
    token: user.token
  });
});

// Get current user info
router.get('/me', async (req, res) => {
  try {
    const token = req.headers.authorization?.replace('Bearer ', '');
    if (!token) {
      return res.status(401).json({ error: 'No token provided' });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET!) as any;
    const user = await prisma.user.findUnique({
      where: { id: decoded.userId },
      select: {
        id: true,
        email: true,
        name: true,
        department: true,
        role: true,
        isActive: true
      }
    });

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    res.json(user);
  } catch (error) {
    res.status(401).json({ error: 'Invalid token' });
  }
});

// Logout endpoint
router.post('/logout', (req, res) => {
  // In a real implementation, you might want to invalidate the token
  // For now, we'll just return success
  res.json({ message: 'Logged out successfully' });
});

export default router;
