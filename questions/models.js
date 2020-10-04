const { Schema, model } = require("mongoose");
const MongoPaging = require('mongo-cursor-pagination');
const constants = require("./constants");

/*
@subjectid -> _id of Subjects model
@topic ->  topic of subject
@question, @a ,@b, @c, @answer are question and answers
@level ->  difficulty of question
@authorid ->  _id of Users Model
@isquestionpremium ->  to know is question is premium or not
@publishquestion ->  to know is question published or not
*/

const QuestionSchema = new Schema(
  {
    subjectid :{ type: String , required: true, trim:true},
    topic: { type: String, required: true,lowercase:true,trim:true},
    question: { type: String, required: true,trim:true },
    a: { type: String, required: true, trim:true },
    b: { type: String, required: true, trim:true },
    c: { type: String, required: true, trim:true },
    answer: { type: String, enum: ['a', 'b','c'] , lowercase:true, trim:true},
    level: { 
      type: String, required: true, 
      enum: ['easy','medium','hard'],lowercase:true,trim:true
    },
    authorid: { type: String ,required: true,trim:true},
    isquestionpremium: { type: String, enum: ['yes', 'no'],default:'no',lowercase:true,trim:true},
    publishquestion: { type: String, enum: ['yes', 'no'] , default:'yes',lowercase:true,trim:true}

  },
  { timestamps: true }
);

QuestionSchema.plugin(MongoPaging.mongoosePlugin);
module.exports = model(constants.COLLECTION_NAME, QuestionSchema);