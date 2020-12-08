const jwt = require('jsonwebtoken');
const secretObj = require('./config/jwt');
const haur = require('./config/sessionHauer.json');

const signToken = (email) => {
    return jwt.sign({'email' : email}, secretObj.secret, { expiresIn : haur})
}
const verifyToken = (token) => {
    return jwt.verify(token, secretObj.secret);
}

module.exports.signToken = signToken;
module.exports.verifyToken = verifyToken;