const router = require('express').Router();

// Add custom imports
require('../login/jwt_token_validation');
const { passportJWT } = require('../login/passport');
const {questions_admin_specific_access_only,superuser_specific_access_only} = require('../login/access_validator');
const Subject = require("./models");

router.post("/add", passportJWT , questions_admin_specific_access_only , async (req,res) => {
    await addSubject(req,res);
});

router.post("/update", passportJWT , superuser_specific_access_only , async (req,res) => {
    await updateSubject(req,res);
});

router.post("/delete", passportJWT , superuser_specific_access_only , async (req,res) => {
    await deleteSubject(req,res);
});

router.post("/all",passportJWT, async (req,res) => {
    await getAllPublishedSubjects(req,res);
});

const addSubject = async(req,res) => {
    try {
        let domain = req.body.domain.toLowerCase().trim();
        let subdomain = req.body.subdomain.toLowerCase().trim();
        let subject = req.body.subject.toLowerCase().trim();
        let authorid = req.user._id.trim();
        if(domain.length == 0 || subdomain.length == 0 || subject.length == 0 || authorid.length == 0){
            return res.status(400).json({ message:`Invalid details`, success:false });
        }
        let validstatus = await validSubjectFields(domain,subdomain,subject);
        if(validstatus){
            const newSubject = new Subject({
                domain : domain, subdomain : subdomain,
                subject : subject, authorid : authorid
            });
            await newSubject.save();        
            return res.status(201).json({ message:`Subject added successfully`, success:true });
        }else{
            return res.status(400).json({ message:`Subject already exists`, success:false });
        }

    } catch (error) {
        return res.status(400).json({
            message: `Something went wrong.If it continues, please reach out to us`,
            success: false
          });
    }
}

const updateSubject = async(req,res) => {
    try {
        let subjectid = req.body.subjectid.trim();
        let domain = req.body.domain.toLowerCase().trim();
        let subdomain = req.body.subdomain.toLowerCase().trim();
        let subject = req.body.subject.toLowerCase().trim();

        if(subjectid.length == 0 || domain.length == 0 || subdomain.length == 0 || subject.length == 0){
            return res.status(400).json({ message:`Invalid details`, success:false });
        }

        let subjectfound = await Subject.findById(subjectid);
        
        if(subjectfound){
            let update_details = {
                domain : domain, subdomain : subdomain, subject : subject
            };
            await Subject.updateOne({_id:subjectid},update_details,{runValidators:true});        
            return res.status(200).json({ message:`Subject updated successfully`, success:true });
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


const deleteSubject = async(req,res) =>{
    try {
        let subjectid = req.body.subjectid.trim();

        if(subjectid.length == 0){
            return res.status(400).json({ message:`Invalid details`, success:false });
        }
        await Subject.findByIdAndDelete(subjectid);
        
    } catch (error) {
        return res.status(400).json({
            message: `Something went wrong`,
            success: false
          });
    }
};


const validSubjectFields = async (domain,subdomain,subject) =>{
    let subjectfound = await Subject.findOne({
        domain : domain,
        subdomain :subdomain,
        subject :subject
    });
    return subjectfound ? false : true;
};

const serializeSubjectOutput = (data) => {
    data =  data.map(input => {
        return {
            domain:input.domain,
            subdomain:input.subdomain,
            subject:input.subject,
            totalquestions:input.totalquestions
        }
    })
    return data
}

const getAllPublishedSubjects = async (req,res) => {
    let data = await Subject.find({publishsubject:"yes"});
    if(data.length > 0){
        return res.status(200).json(serializeSubjectOutput(data));
    }
    return res.status(200).json({
        message:`No data found`,
        success:true
    });
}

module.exports = router;