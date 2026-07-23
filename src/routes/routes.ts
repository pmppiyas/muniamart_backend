import { Router } from 'express';
import { UserRouter } from '../module/user/user.routes';

const router = Router();

interface routerArgs {
  path: string;
  route: Router;
}

const allRoutes: routerArgs[] = [
  {
    path: '/user',
    route: UserRouter,
  },
];

allRoutes.forEach((route) => {
  router.use(route.path, route.route);
});

export default router;
