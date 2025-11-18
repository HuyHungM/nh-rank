import { UserRole } from "@/context/UserContext";
import mongoose, { Schema, Document, Model } from "mongoose";

interface IUser extends Document {
  username: string;
  password?: string;
  name: string;
  role: UserRole;
  avatarUrl: string;
  problem: number;
  submission: number;
  createdAt: Date;
  updatedAt: Date;
}

export interface OUser {
  _id: string;
  username: string;
  password?: string;
  name: string;
  role: UserRole;
  avatarUrl: string;
  problem: number;
  submission: number;
  createdAt: string;
  updatedAt: string;
}

const UserSchema = new Schema<IUser>(
  {
    username: {
      type: String,
      required: true,
      unique: true,
      trim: true,
    },
    password: {
      type: String,
      required: true,
    },
    name: {
      type: String,
      required: true,
      trim: true,
    },
    avatarUrl: {
      type: String,
      default: "",
    },
    role: {
      type: String,
      enum: ["teacher", "student"],
      default: "student",
    },
    problem: {
      type: Number,
      default: 0,
    },
    submission: {
      type: Number,
      default: 0,
    },
  },
  { timestamps: true }
);

const User: Model<IUser> =
  mongoose.models.User || mongoose.model<IUser>("User", UserSchema);

export default User;
