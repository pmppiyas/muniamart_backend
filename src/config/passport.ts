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
        const isUserExist = await prisma.user.findUnique({
          where: {
            email: identifier,
          },
        });

        if (!isUserExist) {
          return done(null, false, { message: 'User not found.' });
        }

        const isPasswordMatch = await bcrypt.compare(
          password,
          isUserExist.password || ''
        );

        if (!isPasswordMatch) {
          return done(null, false, { message: 'Password is wrong.' });
        }

        return done(null, isUserExist, { message: 'Login successfull.' });
      } catch (error) {
        return done(error);
      }
    }
  )
);

passport.serializeUser((user: any, done: (err: any, id?: unknown) => void) => {
  done(null, user._id);
});

passport.deserializeUser(async (id: string, done: any) => {
  try {
    const user = await prisma.user.findUnique({
      where: {
        id,
      },
    });
    done(null, user);
  } catch (error) {
    done(error, null);
  }
});
