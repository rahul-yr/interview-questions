const router = require('express').Router();

// Add custom imports
require('./jwt_token_validation');
const { google_oauth } = require("./google_auth");
const { passportJWT } = require('./passport');
const User = require("./models");


router.post("/gtoken", async (req,res) => {
    req.specifying_role=null;
    await google_oauth(req,res);
});

router.post("/gtoken/qa", async (req,res) => {
    req.specifying_role = "questions_admin";
    await google_oauth(req,res);
});



const sert = (data) => {
    data = data.map(a => {
        return {
            role : a.role,
            email: a.google.email,
            id : a._id
        }
    })
    return data
    
}

router.post("/jwt/validation" ,passportJWT,async(req,res) => {
    let data = {
            message:`token valid`,
            success:true,
    }
    res.status(200).json({
        message:`Token Valid`,
        success:true
    });
});

/*
router.post("/jwt/details", passportJWT ,async (req,res) => {
 try {
        let data = await User.find();

        if(data.length > 0){
            res.status(200).json(sert(data));
        }else{
            res.status(200).json({
                message:`No data found`,
                success:true
            });
        }
        
    } catch (error) {
        console.log(error.message)
    }
});
*/

module.exports = router;