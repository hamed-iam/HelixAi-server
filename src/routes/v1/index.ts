import express from "express";
import homeRoute from "./home.route.js";

const router = express.Router();

const defaultRoutes = [
  {
    path: "/",
    route: homeRoute,
  },
];

defaultRoutes.forEach((route) => {
  router.use(route.path, route.route);
});

export default router;
