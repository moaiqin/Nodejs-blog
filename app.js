
//加载express模块
var express = require('express');
//加载body-parse接受前台发过来的数据
var bodyParser = require('body-parser');
//加载cookies
var cookies = require('cookies');
//加载模板
var swig = require('swig');

var User = require('./models/User');
//创建app应用 =>nodejs http.createServer();
var app = express();

//引入数据库
var mongoose = require('mongoose');

//设置bodyparser
app.use(bodyParser.urlencoded({extended: true}));

//在模板中使用cookies
app.use(function(req,res, next){
	req.cookies = new cookies(req, res);
	//解析用户登陆信息的cookie
	req.userInfo = {};
	if(req.cookies.get('userInfo')){
		try{
			req.userInfo = JSON.parse(req.cookies.get('userInfo'));
			User.findById(req.userInfo._id).then(function(userInfo){
				req.userInfo.isAdmin = userInfo.isAdmin;
			});
			next();
		}catch(e){
			next();
		}
	}else{
		next();
	}
})

//设置文件静态托管,当使用public的路由就会从下面找到文件
app.use('/public', express.static(__dirname + '/public'))

//模板配置
//定义当前使用的模板引擎，
//第一个参数，模板引擎的名称，同时也是模板文本
//第二个参数解析处理模板内容的函数
app.engine('html', swig.renderFile);

//设置模板文件存放的目录，第一个必须是views，第二个是路径
app.set('views', './views');

//注册所有使用的模板引擎,第一个必须是view engine,第二个参数是和swig.engine的第一个参数必须是一致的
app.set('view engine','html');

//swig.renderFile默认是会缓存到内存，当向客户端提供数据会从缓存中去
//线上提高性能，开发开发时，模板文件改变之后，刷新会从缓存中去来，内容和上次不变
//所以要关掉
swig.setDefaults({
	cache:false
});

//首页，根目录路由
/*
*req request对象
*res response对象
*next 函数
*
* 可以把路由都放在router模块下面，就可以把下面app.get政略掉，条例惊喜，用app.use
* */
/*app.get('/', function(res, res, next) {
	//res.send('<h1>欢迎访问我的博客</h1>')
	//读取views下的指定目录文件，解析返回客户端
	//第一个参数，表示模板的文件，相对于views目录
	//第二个参数是传递给模板引擎的数据
	//相当于views/index.html
	res.render('index');
})*/


/*
*
*根据不同功能划分木块
* 
**/

 app.use('/admin',require('./routers/admin'));
 app.use('/api', require('./routers/api'));
 app.use('/', require('./routers/main'));



/*//当一个html里面有个link href="/main.css"时也是一个请求，所以也是需要配置路由的
//可以用文件静态托管处理
app.get('/main.css',function(req, res, next) {
	res.setHeader('Content-Type','text/css');
	res.send('body {background:red}');//这个默认的文件和app.engine的第一个参数一样是heml文件，所以沿设置header
})*/

//监听
//app.listen(4080);

mongoose.Promise = global.Promise;
//连接数据库
mongoose.connect('mongodb://localhost:27017/blog', function(err) {
	if(err){
		console.log('数据库连接失败');
	}else{
		console.log('数据库连接成功');
		app.listen(4080);
	}
})



//用户发送http请求->url->解析路由->找到文件匹配规则->实行指定的函数绑定,返回客户端
//   /public->静态文件->读取返回给客户
//  其他路由->动态->处理业务逻辑，加载模板，解析模板->返回数据