var mongoose = require('mongoose');
module.exports = new mongoose.Schema({
	//关联,如果没有populate（category）那么categoty就是id，有的话categrory就是另一个表{ddd}
	category:{
		type:mongoose.Schema.Types.ObjectId,
		ref:'Category'
	},

	//标题
	title:{
		type:String,
		default:''
	},

	//user
	user:{
		type:mongoose.Schema.Types.ObjectId,
		ref:'User'
	},


	//时间
	date:{
		type:Date,
		default:new Date()
	},

	//浏览数
	views:{
		type:Number,
		default:0
	},

	//简介
	description:{
		type:String,
		default:''
	},

	//内容
	content:{
		type:String,
		default:''
	},
	//评论
	comment:{
		type:Array,
		default:[]
	}
});