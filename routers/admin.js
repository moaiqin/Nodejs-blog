var express = require('express');

var router = express.Router();
var User = require('../models/User');
var Category = require('../models/Category');
var Content = require('../models/Content');


//相当于 admin/user
// router.get('/user', function(req, res) {
// 	res.send('User');
// })
router.use(function(req, res, next){
	if(!req.userInfo.isAdmin) {
		res.send('对不起，只有管理员才有权限进入后台管理');
		return;
	}
	next();
})

router.get('/',function(req , res, next){
	res.render('admin/index',{
		userInfo:req.userInfo
	});
})

router.get('/user',function(req, res, next){
	var page;
	var limit = 4;
	var totalPage = 0;
	var skip;
	if(!isNaN(req.query.page)){
		page = Number(req.query.page);
	}else{
		page = 1;
	}
	User.find().count().then(function(num){
		totalPage = Math.ceil(num/limit);
		page = Math.min(totalPage,page);
		page = Math.max(page,1);
		skip = (page - 1)*limit;
		User.find().skip(skip).limit(limit).then(function(users){
			res.render('admin/user_admin',{
				userInfo:req.userInfo,
				users:users,
				count: totalPage,
				page:page
			});
		})
	});
	
})


/*
*
* 分类管理
 */

router.get('/category',function(req, res, next){
	var page;
	var limit = 2;
	var totalPage;
	var skip;
	if(req.query.page){
		page = Number(req.query.page);
	}else{
		page = 1;
	}

	Category.count().then(function(num){
		totalPage = Math.ceil(num/limit);
		skip = (page-1)*limit;
		Category.find().sort({_id:-1}).skip(skip).limit(limit).then(function(cates){
			
			res.render('admin/category_index',{
				userInfo: req.userInfo,
				cates:cates,
				count: totalPage,
				page:page
			})
		});
	});
})

router.get('/category/edit',function(req,res, next){
	var id = req.query.id || '';
	Category.findOne({
		_id:id
	}).then(function(cate){
		
		if(!cate){
			res.render('admin/error',{
				userInfo:req.userInfo,
				error:'类名不存在'
			})
			return Promise.reject();
		}else{
			res.render('admin/cate_edit',{
				userInfo:req.userInfo,
				cate:cate
			});
		}
	})
})

/*
*
*
* 如果form没有默认action的请求地址，就会请求道form所在的页面地址栏
* /admin/category/edit?id=59676c61d2a6d51f0cdf9c10
 */

router.post('/category/edit',function(req, res, next){
	
	var name = req.body.catename;
	var id = req.query.id;

	Category.findOne({
		_id:id
	}).then(function(cate){
		if(!cate){
			res.render('admin/error',{
				userInfo:req.userInfo,
				error:'该类不存在',
				url:'/admin/category'
			})
			return Promise.reject();
		}else{
			if(name === ''){
				res.render('admin/error',{
					userInfo:req.userInfo,
					error:'该命名不存在',
					url:'/admin/category'
				})
				return Promise.reject();
			}else{
				if(name === cate.name){
					res.render('admin/error',{
						userInfo:req.userInfo,
						error:'编辑成功',
						url:'/admin/category'
					})
					return Promise.reject();
				}else{
					return Category.findOne({
						_id:{$ne:id},
						name:name
					});
				}
			}
		}
	}).then(function(hadCate){
		if(hadCate){
			res.render('admin/error',{
				userInfo:req.userInfo,
				error:'该类名已经存在',
				url:'/admin/category'
			})
			return Promise.reject();
		}else{
			return Category.update({
				_id:id
			},{
				name:name
			})
		}
	}).then(function(){
		res.render('admin/success',{
			userInfo:req.userInfo,
			message:'类名编辑成功',
			url:'/admin/category'
		})
	})
})



router.get('/category/delete',function(req, res, next){
	var id = req.query._id || '';
	console.log(id);
	Category.remove({
		_id:id
	}).then(function(data){
		res.render('admin/success',{
			userInfo:req.userInfo,
			message:'类名删除成功',
			url:'/admin/category'
		})
	});
});

/*
*
* 分类添加
 */
router.get('/category/add',function(req, res, next){
	res.render('admin/category_add',{
		userInfo:req.userInfo
	})
})

/*
*
*baocunshuju，处理表单
 */

router.post('/category/add',function(req,res){
	var name = req.body.catename;
	if(name === ''){
		res.render('admin/error',{
			userInfo:req.userInfo,
			error:'类名不能为空'
		})
	}


	Category.findOne({
		name:name
	}).then(function(cateInfo){
		console.log(cateInfo)
		if(cateInfo){
			res.render('admin/error',{
				userInfo:req.userInfo,
				error:'类名已经存在'
			});
			return Promise.reject();
		}else{
			return new Category({
				name:name
			}).save();
		}
	}).then(function(cateInfo){
		if(cateInfo){
			res.render('admin/success',{
				cateInfo:cateInfo,
				userInfo:req.userInfo,
				message:'添加类名成功',
				url:'/admin/category'
			})
		}
	})
})


/**
 * 文章列表
 */

router.get('/content',function(req,res, next){
	var limit,page,totalPage,skip;
	limit = 10;
	if(req.query.page){
		page = Number(req.query.page);
	}else{
		page = 1;
	}

	Content.count().then(function(num){
		totalPage = Math.ceil(num/limit);
		page = Math.min(page,totalPage);
		page = Math.max(1,page);
		skip = (page - 1)*limit;
		Content.find().sort({_id:-1}).limit(limit).skip(skip).populate(['category','user']).then(function(contents){
			console.log(contents);
			res.render('admin/content_index',{
				userInfo: req.userInfo,
				contents:contents,
				count: totalPage,
				page:page
			});
		})
	});
});

router.get('/content/add',function(req, res, next){
	Category.find().then(function(cates){
		res.render('admin/content_add',{
			userInfo:req.userInfo,
			cates:cates
		})
	})
})

router.post('/content/add',function(req,res, next){

	var title = req.body.title;
	var description = req.body.description;
	var content = req.body.content;
	var category = req.body.category;
	var userId = req.userInfo._id.toString();

	if(title === ''){
		res.render('admin/error',{
			userInfo:req.userInfo,
			error:'标题不能为空'
		})
		return;
	}

	if(content === ''){
		res.render('admin/error',{
			userInfo:req.userInfo,
			error:'内容不能为空'
		})
		return;
	}

	new Content({
		category:category,
		title:title,
		description:description,
		content:content,
		user:userId
	}).save().then(function(contentInfo){
		if(contentInfo){
			res.render('admin/success',{
				userInfo:req.userInfo,
				message:'内容保存成功',
				url:'/admin/content'
			})
		}else{
			res.render('admin/error',{
				userInfo:req.userInfo,
				message:'内容保存失败'
			})
		}
	})

})

router.get('/content/edit',function(req, res, next){
	var id = req.query.id || '';
	Content.findOne({
		_id:id
	}).then(function(contentInfo){
		if(!contentInfo){
			res.render('admin/error',{
				userInfo:req.userInfo,
				error:'该内容不存在'
			});
			return Promise.reject();
		} else {
			Category.find().then(function(cates){
				res.render('admin/content_edit',{
					userInfo:req.userInfo,
					contents:contentInfo,
					cates:cates
				})
			})
		}
	})
})


/**
 * 内容修改
 * @type {[type]}
 */
router.post('/content/edit',function(req, res, next){
	var id = req.query.id || '';
	var title = req.body.title;
	var description = req.body.description;
	var contents = req.body.content;
	var category = req.body.category;

	if(title === ''){
		res.render('admin/error',{
			userInfo:req.userInfo,
			error:'标题不嫩为空'
		})
		return;
	}

	if(contents === ''){
		res.render('admin/error',{
			userInfo:req.userInfo,
			error:'内容不嫩为空'
		})
		return;
	}

	Content.findOne({
		_id:id
	}).then(function(content){
		console.log(content)
		if(!content){
			res.render('admin/error',{
				userInfo:req.userInfo,
				error:'内容不存在'
			})
			return Promise.reject();
		}else{
			if(content.title === title&& content.description === description&&
				content.category === category&&content.content === contents){
				res.render('admin/success',{
					userInfo:req.userInfo,
					message:'内容编辑成功',
					url:'/admin/content'
				})
			} else {
				return Content.update({
					_id:id
				},{
					$set:{
						content:contents,
						category:category,
						description:description,
						title:title
					}
				});
			}
		}
	}).then(function(rs){
		if(rs){
			res.render('admin/success',{
				userInfo:req.userInfo,
				message:'内容编辑成功',
				url:'/admin/content'
			})
		}
	})
})

router.get('/content/delete',function(req, res, next){
	var id = req.query.id || '';
	if(!id){
		res.render('admin/error',{
			userInfo:req.userInfo,
			error:'id不存在'
		})
		return;
	}

	Content.findOne({
		_id:id
	}).then(function(content){
		if(!content){
			res.render('admin/error',{
				userInfo:req.userInfo,
				error:'内容不存在'
			})
			return Promise.reject();
		}else{
			return Content.remove({
				_id:id
			})
		}
	}).then(function(rs){
		if(rs){
			res.render('admin/success',{
				userInfo:req.userInfo,
				message:'删除成功',
				url:'/admin/content'
			})
		}
	})
})

module.exports = router;