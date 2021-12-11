import { Schema, model } from "mongoose";
const levelSchema = new Schema(
  {
    name: String,
  },
  {
    versionKey: false,
  }
);

export default model("Levels", levelSchema);
