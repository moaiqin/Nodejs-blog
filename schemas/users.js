var mongoose = require('mongoose');

module.exports = new mongoose.Schema({
	//用户名
	username: String,
	//密码
	password: String,
	//是否是管理员
	isAdmin: {
		type:Boolean,
		default:false
	}
});