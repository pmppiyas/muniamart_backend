import passport from 'passport';
import { Strategy as LocalStrategy } from 'passport-local';
import bcrypt from 'bcrypt';
import prisma from './prisma';

passport.use(
  new LocalStrategy(
    {
      usernameField: 'email',
      passwordField: 'password',
    },

    async (identifier: string, password: string, done: any) => {
      try {
        // 1. Check Customer
        const customer = await prisma.customer.findUnique({
          where: {
            email: identifier,
          },
        });

        if (customer) {
          const isPasswordMatch = await bcrypt.compare(
            password,
            customer.password || ''
          );

          if (!isPasswordMatch) {
            return done(null, false, { message: 'Password is wrong.' });
          }

          return done(
            null,
            { ...customer, role: 'CUSTOMER' },
            { message: 'Login successful.' }
          );
        }

        // 2. Check Admin
        const admin = await prisma.admin.findUnique({
          where: {
            email: identifier,
          },
        });

        if (admin) {
          const isPasswordMatch = await bcrypt.compare(
            password,
            admin.password || ''
          );

          if (!isPasswordMatch) {
            return done(null, false, { message: 'Password is wrong.' });
          }

          return done(
            null,
            { ...admin, role: 'ADMIN' },
            { message: 'Login successful.' }
          );
        }

        return done(null, false, { message: 'Account not found.' });
      } catch (error) {
        return done(error);
      }
    }
  )
);

passport.serializeUser((user: any, done: (err: any, id?: unknown) => void) => {
  done(null, { id: user.id, role: user.role });
});

passport.deserializeUser(async (payload: any, done: any) => {
  try {
    if (payload.role === 'ADMIN') {
      const admin = await prisma.admin.findUnique({
        where: { id: payload.id },
      });
      done(null, admin ? { ...admin, role: 'ADMIN' } : null);
    } else {
      const customer = await prisma.customer.findUnique({
        where: { id: payload.id },
      });
      done(null, customer ? { ...customer, role: 'CUSTOMER' } : null);
    }
  } catch (error) {
    done(error, null);
  }
});
