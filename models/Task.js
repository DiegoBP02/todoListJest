import mongoose from "mongoose";

const TaskSchema = new mongoose.Schema(
  {
    task: {
      type: String,
      required: [true, "Please provide task"],
      maxlength: 100,
    },
    urgency: {
      type: String,
      enum: ["high", "medium", "low"],
      default: "low",
    },
    createdBy: {
      type: mongoose.Types.ObjectId,
      ref: "User",
      required: [true, "Please provide user"],
    },
    completed: {
      type: Boolean,
      required: true,
      default: false,
    },
  },
  { timestamps: true }
);

export default mongoose.model("Task", TaskSchema);
