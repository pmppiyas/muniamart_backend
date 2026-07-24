import { Router } from 'express';
import { AuthRouter } from '../module/auth/auth.routes';

const router = Router();

interface routerArgs {
  path: string;
  route: Router;
}

const allRoutes: routerArgs[] = [
  {
    path: '/auth',
    route: AuthRouter,
  },
];

allRoutes.forEach((route) => {
  router.use(route.path, route.route);
});

export default router;
