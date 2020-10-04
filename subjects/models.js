const { Schema, model } = require("mongoose");
const constants = require("./constants");

/*
@domain, @subdomain, @subject -> are Domain, Sub Domain , Subject
@authorid ->  _id of Users Model
@issubjectpremium  ->  to know subject premium or not
@publishsubject ->  to know is subject published or not
@totalquestions ->  total count of questions in given subject

*/

const SubjectSchema = new Schema(
  {
    domain: { type: String, required:true, lowercase:true,trim:true},
    subdomain: { type: String, required: true,lowercase:true,trim:true},
    subject: { type: String, required: true,lowercase:true,trim:true},
    authorid: { type: String ,required: true,trim:true},
    issubjectpremium: { type: String, enum: ['yes', 'no'] , default:'no'},
    publishsubject: { type: String, enum: ['yes', 'no'] , default:'yes'},
    totalquestions: {type:Number, default:0}
  },
  { timestamps: true }
);

module.exports = model(constants.COLLECTION_NAME, SubjectSchema);