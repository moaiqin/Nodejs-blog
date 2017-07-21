function cateDelete(id){
	var deleBool = window.confirm('确定删除吗？');
	if(deleBool){
		window.location.href = '/admin/category/delete?_id='+id;
	}
}