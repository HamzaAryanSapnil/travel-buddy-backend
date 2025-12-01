import express from 'express';
import { authRoutes } from '../modules/auth/auth.routes';

const router = express.Router();

const moduleRoutes = [
    {
        path: '/auth',
        route: authRoutes
    },
    // Add more module routes here
    // {
    //     path: '/user',
    //     route: userRoutes
    // },
];

moduleRoutes.forEach(route => router.use(route.path, route.route));

export default router;

