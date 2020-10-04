const { Schema, model } = require("mongoose");
const constants = require("./constants");

/*
@@subjectid -> _id of Subjects model
@topic ->  topic of subject
@totalquestions  ->  tottal count of questions in given topic
*/

const TopicSchema = new Schema(
  {
    subjectid :{ type: String , required: true, trim:true},
    topic: { type: String, required: true,lowercase:true,trim:true},
    totalquestions: {type:Number, default:0}
  },
  { timestamps: true }
);

module.exports = model(constants.COLLECTION_NAME, TopicSchema);