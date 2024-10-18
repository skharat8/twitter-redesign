import express from "express";

import requireUser from "../middleware/requireUser";
import {
  getNotificationsHandler,
  deleteNotificationsHandler,
  markNotificationsReadHandler,
} from "../controllers/notification.controller";

const route = express.Router();

route.get("/", requireUser, getNotificationsHandler);
route.delete("/", requireUser, deleteNotificationsHandler);
route.post("/markRead", requireUser, markNotificationsReadHandler);

export default route;