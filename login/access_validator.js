const superuser_specific_access_only = (req, res, next) =>{
    return (req.user.role == "superuser") ? next() : res.status(401).json("Access Denied");
}

const questions_admin_specific_access_only = (req, res, next) =>{
    return (req.user.role == "questions_admin" || req.user.role == "superuser") ? next() : res.status(401).json("Access Denied");
}

const admin_specific_access_only = (req, res, next) =>{
    return (req.user.role == "admin" || req.user.role == "superuser") ? next() : res.status(401).json("Access Denied");
}

module.exports = {
    superuser_specific_access_only,
    questions_admin_specific_access_only,
    admin_specific_access_only
};
