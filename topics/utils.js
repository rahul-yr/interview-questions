
// Add custom imports
const Topic = require("./models");



const addTopicOrCount = async(subjectid,topic) => {
    let topicfound = await Topic.findOne({
        subjectid : subjectid,
        topic :topic
    });
    if(topicfound){
        let update_details = {
            totalquestions : topicfound.totalquestions+1
        };
        await Topic.updateOne({_id:topicfound._id},update_details,{runValidators:true}); 
    }else{
        const newTopic = new Topic({
            subjectid : subjectid,
            topic :topic
        });
        await newTopic.save();
    }   
}

const decrementTopicWiseCount = async(subjectid,topic) => {
    let topicfound = await Topic.findOne({
        subjectid : subjectid,
        topic :topic
    });
    if(topicfound && topicfound.totalquestions > 0){
        let update_details = {
            totalquestions : topicfound.totalquestions-1
        };
        await Topic.updateOne({_id:topicfound._id},update_details,{runValidators:true}); 
    }
}

module.exports = {
    addTopicOrCount,
    decrementTopicWiseCount
}

