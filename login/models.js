const { Schema, model } = require("mongoose");
const constants = require("./constants");

const UserSchema = new Schema(
  {
    method: {
        type: String,
        enum: ['google', 'facebook'],
        required: true
    },
    google: {
      id: { type: String ,trim:true},
      displayname: { type: String ,trim:true},
      imageurl: { type: String,trim:true },
      email: { type: String, lowercase: true,trim:true }
    },
    facebook: {
      id: { type: String ,trim:true},
      displayname: { type: String ,trim:true},
      imageurl: { type: String,trim:true },
      email: { type: String, lowercase: true,trim:true }
    },
    role :{
      type: String,
      default: "user",
      enum: ["user","questions_admin","admin","superuser"],
      lowercase:true,
      trim:true
    },
    access:{
      type: String,
      default: "no",
      enum: ["yes","no"],
      lowercase:true,
      trim:true
    }
  },
  { timestamps: true }
);

module.exports = model(constants.COLLECTION_NAME, UserSchema);
