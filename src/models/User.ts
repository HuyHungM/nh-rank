import { UserRole } from "@/context/UserContext";
import mongoose, { Schema, Document, Model } from "mongoose";

interface IUser extends Document {
  username: string;
  password: string;
  name: string;
  role: UserRole;
  avatarUrl: string;
  totalPoint: number;
  createdAt: Date;
  updatedAt: Date;
}

export interface OUser {
  _id: string;
  username: string;
  name: string;
  role: UserRole;
  avatarUrl: string;
  totalPoint: number;
  createdAt: string;
  updatedAt: string;
}

const UserSchema = new Schema<IUser>(
  {
    username: {
      type: String,
      required: [true, "Tên đăng nhập là bắt buộc"],
      unique: true,
      trim: true,
      lowercase: true,
      minlength: [3, "Tên đăng nhập phải ≥ 3 ký tự"],
      maxlength: [30, "Tên đăng nhập ≤ 30 ký tự"],
      match: [/^[a-zA-Z0-9_]+$/, "Chỉ được dùng chữ, số và gạch dưới"],
    },
    password: {
      type: String,
      required: [true, "Mật khẩu là bắt buộc"],
      minlength: [6, "Mật khẩu phải ≥ 6 ký tự"],
      select: false,
    },
    name: {
      type: String,
      required: [true, "Họ tên là bắt buộc"],
      trim: true,
      minlength: 1,
      maxlength: 50,
    },
    avatarUrl: {
      type: String,
      default: "",
      validate: {
        validator: (v: string) => !v || /^https?:\/\//.test(v),
        message: "Avatar URL không hợp lệ",
      },
    },
    role: {
      type: String,
      enum: ["teacher", "student"] as const,
      default: "student",
    },
    totalPoint: {
      type: Number,
      default: 0,
      min: 0,
    },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

UserSchema.set("toJSON", {
  transform: (_doc, ret) => {
    const user: Partial<IUser> = { ...ret };

    delete (user as any).password;
    delete (user as any).__v;

    return {
      _id: user._id!.toString(),
      username: user.username!,
      name: user.name!,
      role: user.role!,
      avatarUrl: user.avatarUrl!,
      totalPoint: user.totalPoint!,
      createdAt: user.createdAt!.toISOString(),
      updatedAt: user.updatedAt!.toISOString(),
    } satisfies OUser;
  },
});

UserSchema.set("toObject", {
  transform: (_doc, ret) => {
    delete (ret as any).password;
    delete (ret as any).__v;
    (ret as any)._id = ret._id!.toString();
    return ret;
  },
});

const User: Model<IUser> =
  mongoose.models.User || mongoose.model<IUser>("User", UserSchema);

export default User;
