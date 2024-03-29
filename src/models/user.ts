
/** @format */

import mongoose, { Types } from "mongoose";

const { Schema, model } = mongoose;

export interface UserType extends mongoose.Document {
  _id?: Types.ObjectId;
  username: string;
  email: string;
  password: string;
  profilePicture: string;
  followers: string[];
  following: string[];
  isAdmin: boolean;
  description: string;
  city: string;
  from: string;
  relationship: Number
  bookmarks: Types.ObjectId[]
  notifications: {
    _id?: Types.ObjectId;
    actions: string;
    actionUser: {
      username: string;
      email: string;
      profilePicture: string;
      userId: string
    };
    actionPostId?: string;
    read: boolean;
    dateOfAction: string;
  }[];
  updatedAt: string;
  createdAt: string
}

const UserSchema = new Schema<UserType>({
  username: {
    type: String,
    required: true,
    min: 5,
    max: 20,
    unique: true,
  },
  email: {
    type: String,
    required: true,
    max: 50,
    unique: true,
  },
  password: {
    type: String,
    required: true,
    min: 6,
  },
  profilePicture: {
    type: String,
    default: "images/transparent-avatar.png",
  },
  followers: {
    type: [String],
    default: [],
  },

  following: {
    type: [String],
    default: [],
  },

  isAdmin: {
    type: Boolean,
    default: false,
  },
  description: {
    type: String,
    max: 50,
    default: ""
  },
  city: {
    type: String,
    max: 50,
    default: ""
  },
  from: {
    type: String,
    max: 50,
    default: ""
  },
  relationship: {
    type: Number,
    enum: [1, 2, 3],
    default: 1
  },
  bookmarks: [
    {
      type: Types.ObjectId,
      ref: "Posts"
    }

  ],
  notifications: [
    {

      actions: { type: String },
      actionUser: {
        username: {
          type: String
        },
        email: {
          type: String
        },
        profilePicture: {
          type: String
        },
        userId: {
          type: String
        }
      },
      actionPostId: { type: String },
      read: { type: Boolean },
      dateOfAction: { type: String }
    }
  ]

},
  { timestamps: true }
);

export default model<UserType>("Users", UserSchema);