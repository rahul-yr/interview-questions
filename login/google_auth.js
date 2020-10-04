const {OAuth2Client} = require('google-auth-library');
const JWT = require('jsonwebtoken');

// Add imports
const { GOOGLE_CLIENT_ID, SECRET } = require("../config");
const User = require("./models");

const signGoogleToken = user => {
    const token =  JWT.sign(
        {
          user_id: user._id,
          method:user.method,
          displayname: user.google.displayname,
          email: user.google.email,
          type: user.role
        },
        SECRET,
        { expiresIn: "7 days" }
    );
    const result = {
        token: `Bearer ${token}`,
        expiresIn: 168
    };
    
    return result;
    
};

// Google OAuth2 Strategy
const client = new OAuth2Client(GOOGLE_CLIENT_ID);

const google_oauth = async(req , res)  => {
    try {
        const ticket = await client.verifyIdToken({
            idToken: req.body['tokenId'],
            audience: GOOGLE_CLIENT_ID,
        });
        const payload = ticket.getPayload();

        const {email_verified } = payload;
        if(email_verified){
            const existingUser = await User.findOne({
                 "google.id": payload['sub'], 
                 "google.email": payload['email']
                });

            if (existingUser) {
                console.log('Existing User');
                if(existingUser.role === 'user'){
                    let result = signGoogleToken(existingUser);
                    return res.status(200).json({
                        ...result
                    });
                }else{
                    if(existingUser.access === 'yes'){
                        let result = signGoogleToken(existingUser);
                        return res.status(200).json({
                            ...result
                        }); 
                    }else{
                         // Here you can add Mail conformation Service like 
                        // Please wait admin to approve your request
                        return res.status(201).json({
                            message:"Request has sent successfully.Please wait admin to approve it",
                            success:"true"
                        });
                    }
                }
                
                
            }else{
                console.log("New user");
                if(req.specifying_role){
                    const newUser = new User({
                        method: 'google',
                        google: {
                            id: payload['sub'],
                            displayname: payload['name'],
                            imageurl: payload['picture'],
                            email: payload['email']
                        },
                        role: req.specifying_role
                    });
                    await newUser.save();
                    // Here you can add Mail conformation Service like 
                    // Please wait admin to approve your request
                    return res.status(201).json({
                        message:"Request has sent successfully.Please wait admin to approve it",
                        success:"true"
                    });
                }else{
                    const newUser = new User({
                        method: 'google',
                        google: {
                            id: payload['sub'],
                            displayname: payload['name'],
                            imageurl: payload['picture'],
                            email: payload['email']
                        }
                    });
                    await newUser.save();
                    let result = signGoogleToken(newUser);
                    return res.status(201).json({
                        ...result,
                    });
                }
            }
        }else{
            return res.status(400).json({
                message:`Please verify your Email id`,
                success:false
            });
        }
    } catch (error) {
        // console.log(error)
        return res.status(400).json({
            message:`Something went wrong. If it continues, please reach out to us`,
            success:false
        });
    }
};


module.exports = {
    google_oauth
};