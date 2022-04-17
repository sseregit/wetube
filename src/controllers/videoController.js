import Video from "../models/Video";
import Comment from "../models/Comment";
import User from "../models/User";

export const home = async (req, res) => {
  try {
    const videos = await Video.find({})
      .sort({ createAt: "desc" })
      .populate("owner");
    return res.render("home", { pageTitle: "Home", videos });
  } catch {}
};
export const search = async (req, res) => {
  const { keyword } = req.query;
  let videos = [];
  if (keyword) {
    videos = await Video.find({
      title: { $regex: `^${keyword}`, $options: "i" },
    }).populate("owner");
  }
  return res.render("search", { pageTitle: "Search", videos });
};
export const watch = async (req, res) => {
  const { id } = req.params;
  const video = await Video.findById(id).populate("owner").populate("comment");
  if (!video) {
    return res.render("404", { pageTitle: "Video not found" });
  }
  return res.render("watch", { pageTitle: video.title, video });
};
export const getUpload = (req, res) => {
  const { id } = req.params;
  res.render("upload");
};
export const postUpload = async (req, res) => {
  const {
    user: { _id },
  } = req.session;
  const { video, thumbnail } = req.files;
  const { title, description, hashtags } = req.body;
  const Newvideo = new Video({
    title,
    description,
    fileUrl: video[0].location,
    thumbnailUrl: thumbnail[0].location.replace(/[\\]/g, "/"),
    owner: _id,
    hashtags: Video.formatHashtags(hashtags),
  });
  await Newvideo.save();
  const user = await User.findById(_id);
  user.videos.push(Newvideo);
  await user.save();
  res.redirect("/");
};
export const getEdit = async (req, res) => {
  const { id } = req.params;
  const {
    user: { _id },
  } = req.sesion;
  const video = await Video.findById(id);
  if (!video) {
    return res.status(404).render("404", { pageTitle: "Video not found" });
  }
  if (String(video.owner) !== String(_id)) {
    req.flash("error", "You are not the owner of the video.");
    return res.status(403).redirect("/");
  }
  return res.render("edit", { pageTitle: `Edit ${video.title}`, video });
};
export const postEdit = async (req, res) => {
  const { id } = req.params;
  const {
    user: { _id },
  } = req.sesion;
  const { title, description, hashtags } = req.body;
  const video = await Video.findById(id);
  if (!video) {
    return res.status(404).render("404", { pageTitle: "Video not found" });
  }
  if (String(video.owner) !== String(_id)) {
    return res.status(403).redirect("/");
  }
  await Video.findByIdAndUpdate(id, {
    title,
    description,
    hashtags: Video.formatHashtags(hashtags),
  });
  return res.redirect(`/videos/${id}`);
};
export const deleteVideo = async (req, res) => {
  const {
    user: { _id },
  } = req.session;
  const { id } = req.params;
  const video = await Video.findById(id);
  if (!video) {
    return res.status(404).render("404", { pageTitle: "Video not found" });
  }
  if (String(video.owner) !== String(_id)) {
    return res.status(403).redirect("/");
  }
  const user = await User.findById(_id);
  if (!user) {
    return res.status(404).render("404", { pageTitle: "User not found" });
  }
  user.videos.splice(user.videos.indexOf(id), 1);
  await user.save();
  for (const commentId of video.comment) {
    const comment = await Comment.findById(commentId.toString());
    const commentOwner = await User.findById(comment.owner);
    commentOwner.comment.splice(commentOwner.comment.indexOf(comment._id), 1);
    await commentOwner.save();
    await comment.deleteOne({ _id: id });
  }

  await Video.findByIdAndDelete(id);
  req.flash("success", "성공적으로 삭제되었습니다.");
  res.redirect("/");
};

export const registerView = async (req, res) => {
  const { id } = req.params;
  const video = await Video.findById(id);
  if (!video) {
    return res.sendStatus(404);
  }
  video.meta.views = video.meta.views + 1;
  await video.save();
  return res.sendStatus(200);
};

export const createComment = async (req, res) => {
  const {
    params: { id },
    body: { text },
    session: {
      user: { _id: userid },
    },
  } = req;

  const video = await Video.findById(id);
  if (!video) {
    return res.sendStatus(404);
  }
  const user = await User.findById(userid);
  if (!user) {
    return res.sendStatus(404);
  }
  const comment = await Comment.create({
    text,
    owner: user._id,
    video: id,
  });
  video.comment.push(comment._id);
  video.save();
  user.comment.push(comment._id);
  user.save();
  return res.status(201).json({ newCommentId: comment._id });
};

export const deleteComment = async (req, res) => {
  const { id } = req.params;
  const comment = await Comment.findById(id);
  if (!comment) {
    req.flash("error", "Comment not found");
    return res.sendStatus(404);
  }
  const user = await User.findById(comment.owner);
  const video = await Video.findById(comment.video);
  user.comment.splice(user.comment.indexOf(id), 1);
  video.comment.splice(video.comment.indexOf(id), 1);
  user.save();
  video.save();
  await comment.deleteOne({ _id: id });
  return res.sendStatus(201);
};
