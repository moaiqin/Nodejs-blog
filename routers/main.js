var express = require('express');
var Category = require('../models/Category');
var Content = require('../models/Content');

var router = express.Router();
var data ={};
router.use(function(req,res,next){
	data.userInfo = req.userInfo;
	Category.find().then(function(cates){
		data.cates = cates;
		next();
	})
})

router.get('/', function(req, res, next) {
	data.limit = 4,
	data.category = req.query.category || '',
	data.page = Number(req.query.page) || 1,
	data.totalPage = 0,
	data.skip = 0,
	data.contents = []
	var where = {};

	if(data.category){
		where.category = data.category;
	}

	Content.where(where).count().then(function(rowsNum){
		data.totalPage = Math.ceil(rowsNum/data.limit);
		data.page = Math.min(data.page,data.totalPage);
		data.page = Math.max(1,data.page);
		data.skip = (data.page - 1)*data.limit;
		return Content.where(where).find().sort({_id:-1}).limit(data.limit).skip(data.skip).populate(['category','user'])
	}).then(function(contents){
		data.contents = contents;
		res.render('main/index',data);
	})

})

router.get('/view',function(req,res,next){
	var id = req.query.content;
	Content.findOne({
		_id:id
	}).populate('user').then(function(contentInfo){
		data.content = contentInfo;
		contentInfo.views++;
		contentInfo.save();
		res.render('main/content_view',data);
	});
})
 
module.exports = router;