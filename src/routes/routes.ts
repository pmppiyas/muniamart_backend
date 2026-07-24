import { Router } from 'express';
import { AuthRouter } from '../module/auth/auth.routes';
import { CategoryRouter } from '../module/category/category.routes';
import { ProductRouter } from '../module/product/product.routes';
import { OrderRoutes } from '../module/order/order.routes';

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
  {
    path: '/product',
    route: ProductRouter,
  },
  {
    path: '/order',
    route: OrderRoutes,
  },
];

allRoutes.forEach((route) => {
  router.use(route.path, route.route);
});

export default router;
