import express from "express";
import {
  watch,
  getUpload,
  postUpload,
  getEdit,
  postEdit,
  deleteVideo,
} from "../controllers/videoController";
import {
  protectorMiddleware,
  sharedArrayBufferMiddleware,
  videoUpload,
} from "../middlewares";

const videoRouter = express.Router();

videoRouter.use(sharedArrayBufferMiddleware);
videoRouter
  .route("/upload")
  .all(protectorMiddleware)
  .get(getUpload)
  .post(
    videoUpload.fields([
      { name: "video", maxCount: 1 },
      { name: "thumbnail", maxCount: 1 },
    ]),
    postUpload
  );
videoRouter.get("/:id([0-9a-f]{24})", watch);
videoRouter
  .route("/:id([0-9a-f]{24})/edit")
  .all(protectorMiddleware)
  .get(getEdit)
  .post(postEdit);
videoRouter
  .route("/:id([0-9a-f]{24})/delete")
  .all(protectorMiddleware)
  .get(deleteVideo);

export default videoRouter;
