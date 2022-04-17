import mongoose from "mongoose";

const videoSchema = new mongoose.Schema({
  title: { type: String, required: true, trim: true, maxlength: 80 },
  fileUrl: { type: String, required: true },
  thumbnailUrl: { type: String, required: true },
  description: { type: String, required: true, trim: true, minlength: 20 },
  createAt: { type: Date, required: true, default: Date.now },
  hashtags: [{ type: String, trim: true }],
  meta: {
    views: { type: Number, required: true, default: 0 },
    rating: { type: Number, required: true, default: 0 },
  },
  comment: [{ type: mongoose.Schema.Types.ObjectId, ref: "Comment" }],
  owner: {
    type: mongoose.Schema.Types.ObjectId,
    required: true,
    ref: "User",
  },
});

videoSchema.static("formatHashtags", function (hashtags) {
  return hashtags.split(",").map((word) => `#${word}`);
});

const Video = mongoose.model("Video", videoSchema);

export default Video;
