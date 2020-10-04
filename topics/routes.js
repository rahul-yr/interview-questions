const router = require('express').Router();
const Topic = require('./models');

// Add custom imports
require('../login/jwt_token_validation');
const { passportJWT } = require('../login/passport');

router.post("/filters",passportJWT,async (req,res) => {
    await getAllTopicsOfSubject(req,res);
})


const serializeTopicOutput = (data) => {
    data = data.map(input => {
        return {
            subjectid:input.subjectid,
            topic:input.topic,
            totalquestions:input.totalquestions
        }
    })
    return data 
}

const getAllTopicsOfSubject = async (req,res) => {
    let subjectid = req.body.subjectid.trim();
    if(subjectid.length == 0){
        return res.status(400).json({ message:`Invalid details`, success:false });
    }
    let data = await Topic.find({subjectid:subjectid});

    if(data.length > 0){
        return res.status(200).json(serializeTopicOutput(data));
    }
    return res.status(200).json({
        message:`No data found`,
        success:true
    });
}

module.exports = router;