
// Add custom imports
const Subject = require("./models");



const addSubjectCount = async(subjectid) => {
    let subjectfound = await Subject.findById(subjectid);
    if(subjectfound){
        let update_details = {
            totalquestions : subjectfound.totalquestions+1
        };
        await Subject.updateOne({_id:subjectid},update_details,{runValidators:true}); 
    } 
}

const decrementSubjectWiseCount = async(subjectid) => {
    let subjectfound = await Subject.findById(subjectid);

    if(subjectfound && subjectfound.totalquestions > 0){
        let update_details = {
            totalquestions : subjectfound.totalquestions-1
        };
        await Subject.updateOne({_id:subjectid},update_details,{runValidators:true}); 
    }
}

module.exports = {
    addSubjectCount,
    decrementSubjectWiseCount
}

