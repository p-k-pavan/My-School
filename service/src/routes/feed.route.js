import express from "express";
import {
    createFeedPost,
    getAllFeedPost,
    getFeedPostById,
    updateFeedPost,
    deleteFeedPost,
    pinFeedPost,
    unpinFeedPost
} from "../controllers/feed.controller.js";
import { isAuthenticated } from "../middleware/TokenVerify.js";
import { authorizeRoles } from "../middleware/role.middleware.js";
import { upload } from "../middleware/multer.js";

const router = express.Router();

router.use(isAuthenticated);

router.post(
    "/",
    authorizeRoles("admin", "management", "teacher"),
    upload.array("attachments", 5),
    createFeedPost
);

router.get(
    "/",
    getAllFeedPost
);

router.get(
    "/:feedId",
    getFeedPostById
);

router.put(
    "/:feedId",
    authorizeRoles("admin", "management", "teacher"),
    upload.array("attachments", 5),
    updateFeedPost
);

router.delete(
    "/:feedId",
    authorizeRoles("admin", "management", "teacher"),
    deleteFeedPost
);

router.put(
    "/:feedId/pin",
    authorizeRoles("admin", "management", "teacher"),
    pinFeedPost
);

router.put(
    "/:feedId/unpin",
    authorizeRoles("admin", "management", "teacher"),
    unpinFeedPost
);

export default router;
