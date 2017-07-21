var express = require('express');
var router = express.Router();
var User = require('../models/User');
var Content = require('../models/Content');

var responseData;
router.use(function(req, res , next){
	//每次调用api下面的这个都被初始化，code为0
	responseData = {
		code:0,
		message:''
	};
	next();
})


router.post('/user/register',function(req, res, next) {
	var username = req.body.username;
	var password = req.body.password;
	var repassword = req.body.password2;

	//用户名是否为空；
	if(username === ''){
		responseData.code =1;
		responseData.message = '用户名不能为空';
		res.json(responseData);
		return;
	}

	//密码不能为空
	if(password === ''){
		responseData.code = 2;
		responseData.message = '密码不能为空';
		res.json(responseData);
		return;
	}

	//两次密码要一样
	if(password !== repassword){
		responseData.code = 3;
		responseData.message = '两次密码不一样';
		res.json(responseData);
		return;
	}

	User.findOne({
		username:username
	}).then(function(userinfo){
		if(userinfo){
			//表示有数
			responseData.code = 4;
			responseData.message = '用户名已经存在';
			res.json(responseData);
			return;
		}else{
			//表示没有数据
			var user = new User({
				username:username,
				password:password
			});
			return user.save();
		}
	}).then(function(newUserinfo){
		if(newUserinfo){
			responseData.message = '注册成功';
			res.json(responseData);
		}
	})
	
})

router.post('/user/login',function(req, res, next) {
	var username = req.body.username;
	var password = req.body.password;
	if(!username) {
		responseData.code = 1;
		responseData.message = '用户名不能为空';
		res.json(responseData);
		return;
	}

	if(!password) {
		responseData.code = 2;
		responseData.message ='密码不能为空';
		res.json(responseData);
		return;
	}

	User.findOne({
		username:username,
		password:password
	}).then(function(userinfo) {

		if(!userinfo){
			responseData.code = 3;
			responseData.message = '用户不存在或密码错误';
			res.json(responseData);
			return;
		}
		responseData.userInfo = {
			_id:userinfo._id,
			username:userinfo.username
		};
		//每次都会把cookies请求数据到服务端
		req.cookies.set('userInfo',JSON.stringify({
			_id:userinfo._id,
			username:userinfo.username,
			isAdmin:userinfo.isAdmin
		}));
		responseData.message = '登陆成功';
		res.json(responseData);
	})
})

router.get('/user/logout',function(req,res,next){
	req.cookies.set('userInfo', null);
	res.json(responseData);
})


/**
 * 评论提交
 * @type {[type]}
 */

router.post('/comment/post',function(req, res, next){
	var contentId = req.body.contentId || '';
	var postData = {
		username:req.userInfo.username,
		userId:req.userInfo._id.toString(),
		postDate:new Date(),
		content:req.body.content
	}
	console.log(contentId)

	if(!req.body.content){
		responseData.message = '评论不能为空';
		responseData.code = 1;
		res.json(responseData);
		return;
	}
	//查找该条内容
	Content.findOne({
		_id:contentId
	}).then(function(content){
		//content是entity类型，有save方法
		content.comment.push(postData);
		return content.save();//返回的是保存之后的表
	}).then(function(newContent){
		if(newContent){
			responseData.message = '评论成功';
			responseData.data = newContent;
			res.json(responseData);
		}
	})
});


/**
 * 获取评论
 */

router.get('/comment',function(req, res, next){
	var id = req.query.content || '';
	Content.findOne({
		_id:id
	}).then(function(contentInfo){
		console.log(contentInfo)
		responseData.data = contentInfo.comment;
		res.json(responseData);
	})
})


module.exports = router; 