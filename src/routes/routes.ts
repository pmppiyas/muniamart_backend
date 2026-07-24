import { Router } from 'express';
import { AuthRouter } from '../module/auth/auth.routes';
import { CategoryRouter } from '../module/category/category.routes';

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
  {
    path: '/category',
    route: CategoryRouter,
  },
];

allRoutes.forEach((route) => {
  router.use(route.path, route.route);
});

export default router;
