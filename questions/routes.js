const router = require('express').Router();

// Add custom imports
require('../login/jwt_token_validation');
const { passportJWT } = require('../login/passport');
const {questions_admin_specific_access_only,superuser_specific_access_only} = require('../login/access_validator');
const Question = require("./models");
const {addTopicOrCount, decrementTopicWiseCount} = require('../topics/utils');
const Subject = require('../subjects/models');
const {addSubjectCount, decrementSubjectWiseCount} = require('../subjects/utils');

router.post("/add", passportJWT , questions_admin_specific_access_only , async (req,res) => {
    await addQuestion(req,res);
});

router.post("/update", passportJWT , questions_admin_specific_access_only , async (req,res) => {
    await updateQuestion(req,res);
});

router.post("/delete", passportJWT , questions_admin_specific_access_only , async (req,res) => {
    await deleteQuestion(req,res);
});

router.post("/sub/top/p",passportJWT,async (req,res) => {
    await getQuestionsBasedOnSubjectTopic(req,res);
})

router.post("/sub/top/quead",passportJWT,questions_admin_specific_access_only,async (req,res) => {
    await getMyQuestionsBasedOnSubjectTopic(req,res);
})

router.post("/sub/top/sups",passportJWT,superuser_specific_access_only,async (req,res) => {
    await getQuestionsBasedOnSubjectTopicBySuperuser(req,res);
})

const addQuestion = async(req,res) =>{
    try {
        let subjectid = req.body.subjectid.trim();
        let topic = req.body.topic.toLowerCase().trim();
        let question = req.body.question.trim();
        let a = req.body.a.trim();
        let b = req.body.b.trim();
        let c = req.body.c.trim();
        let answer = req.body.answer.toLowerCase().trim();
        let level = req.body.level.toLowerCase().trim();
        let authorid = req.user._id.trim();
        let publishquestion = req.body.publishquestion.trim();
        if(subjectid.length == 0 || topic.length == 0 || question.length == 0 || a.length == 0 || b.length == 0 || c.length == 0 || answer.length == 0 || level.length == 0 || authorid.length == 0 || publishquestion.length == 0){
            return res.status(400).json({ message:`Invalid details`, success:false });
        }

        let subjectfound = await Subject.findById(subjectid);
        if(subjectfound){
            const newQuestion = new Question({
                subjectid : subjectid,topic : topic, question : question, a : a, b : b, c : c,
                answer : answer, level : level, authorid:authorid,publishquestion:publishquestion
            });
            await newQuestion.save(); 
            
            addSubjectCount(subjectid);
            addTopicOrCount(subjectid,topic);
            
            return res.status(201).json({ message:`Question added successfully`, success:true });
        }else{
            return res.status(400).json({ message:`Invalid details`, success:false });
        }

    } catch (error) {
        return res.status(400).json({ 
            message: `Something went wrong.If it continues, please reach out to us`,
            success: false
          });
    }
}

const updateQuestion = async(req,res) =>{
    try {
        let questionid = req.body.questionid.trim();
        let subjectid = req.body.subjectid.trim();
        let topic = req.body.topic.toLowerCase().trim();
        let question = req.body.question.trim();
        let a = req.body.a.trim();
        let b = req.body.b.trim();
        let c = req.body.c.trim();
        let answer = req.body.answer.toLowerCase().trim();
        let level = req.body.level.toLowerCase().trim();
        let authorid = req.user._id.trim();
        let publishquestion = req.body.publishquestion.trim();

        if(questionid.length == 0 || subjectid.length == 0 || topic.length == 0 || question.length == 0 || a.length == 0 || b.length == 0 || c.length == 0 || answer.length == 0 || level.length == 0 || authorid.length == 0 || publishquestion.length == 0){
            return res.status(400).json({ message:`Invalid details`, success:false });
        }

        let questionfound = await Question.findById(questionid);
        let subjectfound = await Subject.findById(subjectid);

        if(questionfound && subjectfound && questionfound.authorid === authorid){

            let update_details = {
                subjectid : subjectid,topic : topic, question : question, a : a, b : b, c : c,
                answer : answer, level : level,publishquestion:publishquestion
            };
            await Question.updateOne({_id:questionid},update_details,{runValidators:true});    
            
            if(!questionfound.topic === topic){
                decrementTopicWiseCount(subjectid,questionfound.topic);
                addTopicOrCount(subjectid,topic);
            }
            if(!subjectid === questionfound.subjectid){
                decrementSubjectWiseCount(questionfound.subjectid);
                addSubjectCount(subjectid);
            }

            return res.status(200).json({ message:`Question updated successfully`, success:true });
        }else{
            return res.status(400).json({ message:`Action is not allowed`, success:false });
        }

    } catch (error) {
        return res.status(400).json({
            message: `Something went wrong.If it continues, please reach out to us`,
            success: false
          });
    }
}

const deleteQuestion = async(req,res) =>{
    try {
        let questionid = req.body.questionid.trim();
        let authorid = req.user._id.trim();
        if(questionid.length == 0){
            return res.status(400).json({ message:`Invalid details`, success:false });
        }
        let questionfound = await Question.findById(questionid);
        if(questionfound && questionfound.authorid === authorid){
            await Question.findByIdAndDelete(questionid);
            decrementTopicWiseCount(questionfound.subjectid,questionfound.topic);
        }else{
            return res.status(400).json({ message:`Action is not allowed`, success:false });
        }
    } catch (error) {
        return res.status(400).json({
            message: `Something went wrong.If it continues, please reach out to us`,
            success: false
          });
    }
}

const serializeQuestionOutput = (data) => {
    data = data.map(input => {
        return {
            topic:input.topic,
            question:input.question,
            a: input.a,
            b: input.b,
            c:input.c,
            answer:input.answer,
            level:input.level,
            publishquestion:input.publishquestion
        }
    })
    return data 
}

const getQuestionsBasedOnSubjectTopic = async(req,res) => {
    let subjectid = req.body.subjectid.trim();
    let topic = req.body.topic.toLowerCase().trim();

    if(subjectid.length == 0 || topic.length == 0){
        return res.status(400).json({ message:`Invalid details`, success:false });
    }

    let opts = {subjectid:subjectid,topic:topic,publishquestion:"yes"}
    let limitcount = 50;

    if(req.body.next){
        let data = await Question.paginate({limit : limitcount,query:opts ,next:req.body.next});
        if(data.length > 0){
            return res.status(200).json(serializeQuestionOutput(data));
        }else{
            return res.status(400).json({ message:`No data found`, success:true });
        }
    }else if(req.body.previous){
        let data = await Question.paginate({limit : limitcount,query:opts ,previous:req.body.previous });
        if(data.length > 0){
            return res.status(200).json(serializeQuestionOutput(data));
        }else{
            return res.status(400).json({ message:`No data found`, success:true });
        }
    }else{
        let data = await Question.paginate({limit : limitcount,query:opts });
        if(data.length > 0){
            return res.status(200).json(serializeQuestionOutput(data));
        }else{
            return res.status(400).json({ message:`No data found`, success:true });
        }
    }
}

const getMyQuestionsBasedOnSubjectTopic = async(req,res) => {
    let subjectid = req.body.subjectid.trim();
    let topic = req.body.topic.toLowerCase().trim();
    let authorid = req.user._id.trim();

    if(subjectid.length == 0 || topic.length == 0 || authorid.length == 0){
        return res.status(400).json({ message:`Invalid details`, success:false });
    }

    let opts = {subjectid:subjectid,topic:topic,authorid:authorid}
    let limitcount = 50;

    if(req.body.next){
        let data = await Question.paginate({limit : limitcount,query:opts ,next:req.body.next});
        if(data.length > 0){
            return res.status(200).json(serializeQuestionOutput(data));
        }else{
            return res.status(400).json({ message:`No data found`, success:true });
        }
    }else if(req.body.previous){
        let data = await Question.paginate({limit : limitcount,query:opts ,previous:req.body.previous });
        if(data.length > 0){
            return res.status(200).json(serializeQuestionOutput(data));
        }else{
            return res.status(400).json({ message:`No data found`, success:true });
        }
    }else{
        let data = await Question.paginate({limit : limitcount,query:opts });
        if(data.length > 0){
            return res.status(200).json(serializeQuestionOutput(data));
        }else{
            return res.status(400).json({ message:`No data found`, success:true });
        }
    }
}

const getQuestionsBasedOnSubjectTopicBySuperuser = async(req,res) => {
    let subjectid = req.body.subjectid.trim();
    let topic = req.body.topic.toLowerCase().trim();

    if(subjectid.length == 0 || topic.length == 0){
        return res.status(400).json({ message:`Invalid details`, success:false });
    }
    let opts = {subjectid:subjectid,topic:topic}
    let limitcount = 50;

    if(req.body.next){
        let data = await Question.paginate({limit : limitcount,query:opts ,next:req.body.next});
        if(data.length > 0){
            return res.status(200).json(serializeQuestionOutput(data));
        }else{
            return res.status(400).json({ message:`No data found`, success:true });
        }
    }else if(req.body.previous){
        let data = await Question.paginate({limit : limitcount,query:opts ,previous:req.body.previous });
        if(data.length > 0){
            return res.status(200).json(serializeQuestionOutput(data));
        }else{
            return res.status(400).json({ message:`No data found`, success:true });
        }
    }else{
        let data = await Question.paginate({limit : limitcount,query:opts });
        if(data.length > 0){
            return res.status(200).json(serializeQuestionOutput(data));
        }else{
            return res.status(400).json({ message:`No data found`, success:true });
        }
    }
}


module.exports = router;