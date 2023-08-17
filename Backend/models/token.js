const mongoose = require("mongoose");
const { Schema } = mongoose;

const refreshToken = new Schema(
  {
    token: { type: String, required: true },
    userId: { type: mongoose.SchemaTypes.ObjectId, ref: "users" },
  },
  { timestamps: true }
);
module.exports = mongoose.model("RefreshToken", refreshToken, "tokens");
