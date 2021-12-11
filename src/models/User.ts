import { model, Schema } from "mongoose";

const userSchema = new Schema(
    {
        firstName: {
            type: String,
            required: true
        },
        lastName: {
            type: String,
            required: true
        },
        email: {
            type: String,
            required: true,
            unique: true
        },
        password: {
            type: String,
            required: true,
        },
        role: {
            type: Schema.Types.ObjectId,
            ref: "Roles",
        },
        level: {
            type: Schema.Types.ObjectId,
            ref: "Levels"
        }
    },
    {
        timestamps: true,
        versionKey: false,
    }
);

export default model("Users", userSchema);