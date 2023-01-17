const jwt = require('jsonwebtoken');
const  env = require('dotenv').config();

const AuthToken = process.env.AuthToken;

module.exports = (req, res, next) => {
    try {
        const token = req.headers.authorization.split(' ')[1];
        const decodedToken = jwt.verify(token, AuthToken);
        const userId = decodedToken.userId;
        req.auth = {
            userId: userId
        };
        next();
    }
    catch(error) {
        res.status(401).json({error});
    };
}