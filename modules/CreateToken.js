const jwt = require('jsonwebtoken');
const secretObj = require('./configs/jwt');
const haur = require('./configs/sessionHauer.json');

const signToken = (email) => {
    return jwt.sign({'email' : email}, secretObj.secret, { expiresIn : haur})
}
const verifyToken = (token) => {
    return jwt.verify(token, secretObj.secret);
}

module.exports = {signToken, verifyToken}