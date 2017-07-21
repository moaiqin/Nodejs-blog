$(function(){
	var loginBox = $('#login');
	var logoutBox = $('#logout');
	var userBox = $('#user-info');


	$('.blog-nav li').on('click',function(){
		$('.blog-nav li').filter('.active').removeClass('active');
		$(this).addClass('active');
	})
	loginBox.find('a').on('click', function() {
		logoutBox.show();
		loginBox.hide();
	})
	logoutBox.find('a').on('click', function() {
		loginBox.show();
		logoutBox.hide();
	})
	loginBox.find('button').on('click',function() {
		$.ajax({
			type:'post',
			url:'/api/user/login',
			data:{
				username:loginBox.find('[name="username"]').val(),
				password:loginBox.find('[name="password"]').val()
			},
			dataType:'json',
			success:function(data){
				loginBox.find('.login-message').html(data.message);
				if(!data.code){
					window.location.reload();
				}
			}
		});
	});
	logoutBox.find('button').on('click',function() {
		var username = logoutBox.find('[name="username"]').val();
		var password = logoutBox.find('[name="password"]').val();
		var password2 = logoutBox.find('[name="password2"]').val();
		$.ajax({
			type:'post',
			url:'/api/user/register',
			data:{
				username:username,
				password:password,
				password2:password2
			},
			dataType:'json',
			success:function(data){
				logoutBox.find('.register-message').html(data.message);
				if(!data.code){
					setTimeout(function(){
						loginBox.show();
						logoutBox.hide();
					},1000)
				}
			}

		})
	});

	var commentList = $('.comment-page li');
	var curPage = $('.cur-page span');
	var start = 0;
	var limit = 4;
	var end = 0;
	var resData;
	var totalPage = 0;
	var page = 1;

	//和获取评论信息
	$.ajax({
		type:'get',
		url:'/api/comment',
		data:{
			content:$('#contentId').val()
		},
		dataType:'json',
		success:function(response){
			resData  =  response.data.reverse();
			renderView(response.data.reverse());
		}
	});
	commentList.eq(0).on('click',function(){
		page--;
		renderView(resData);
	});
	commentList.eq(1).on('click',function(){
		page++;
		renderView(resData);
	});

	function renderView(comments){
		if(comments.length === 0){
			$('.comment-page').hide();
			return;
		}else{
			$('.no-msg').hide();
		}
		var html = '';
		totalPage = Math.ceil(comments.length/limit);
		if(page<=1){
			page = 1;
			commentList.eq(0).html('<span>上一页</span>');
		}else{
			commentList.eq(0).html('<a href="javescript:;">上一页</a>');
		}
		if(page>=totalPage){
			page = totalPage;
			commentList.eq(1).html('<span>下一页</span>')
		}else{
			commentList.eq(1).html('<a href="javescript:;">下一页</a>');
		}
		start =(page-1)*limit;
		end = start+limit;
		if(end>comments.length){
			end  = comments.length;
		}
		curPage.eq(0).html(page);
		curPage.eq(1).html(totalPage);
		$('.comment-total').html('一共有'+comments.length+'条评论');
		for(var i = start; i<end; i++){
			html+='<li><div class="clearfix"><a href="#" class="pull-left">'+comments[i].username+'</a><span class="pull-right">'+dateFmat(comments[i].postDate)+'</span></div><p>'+comments[i].content+'</p></li>';
		}
		$('#content').val('');
		$('.comment-list').html(html);
	}

	$('.logout').eq(0).on('click', function () {
		$.ajax({
			type:'get',
			url:'/api/user/logout',
			dataType:'json',
			success:function(res){
				if(!res.code){
					window.location.reload();
				}
			}
		})
	})
	$('.submit').on('click',function(){
		
		$.ajax({
			type:'post',
			url:'/api/comment/post',
			data:{
				contentId:$('#contentId').val(),
				content:$('#content').val()
			},
			dataType:'json',
			success:function(response){
				if(!response.code){
					page = 1;
					resData = response.data.comment.reverse();
					renderView(response.data.comment.reverse());
				}
			}
		});
	})
})


function dateFmat(time){
	var date = new Date(time);
	var str ='';
	str = date.getFullYear()+'-' + dateGetTwo((date.getMonth()+1)) + '月'+ dateGetTwo(date.getDate()) +'日'+ ' ' + dateGetTwo(date.getHours())+':'+dateGetTwo(date.getMinutes())+':'+dateGetTwo(date.getSeconds());
	return str
}

function dateGetTwo(num){
	return num>10? num:'0'+num;
}