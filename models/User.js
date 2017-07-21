var mongoose = require('mongoose');

var userSchema = require('../schemas/users');

module.exports = mongoose.model('User',userSchema);