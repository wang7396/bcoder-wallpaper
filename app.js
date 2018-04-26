
var $tag = "all";
var $nowpage =1;
var $perpage = 15;
var $numPage = 1;
var $scrolltop = 0;
var req;
var getfileID = "0";
var updateurl = "http://pan.bcoderss.com/?dir=%E5%A3%81%E7%BA%B8app%5B%E6%9C%AA%E5%AE%8C%E6%88%90%5D";
var baseurl = "http://bizhi.bcoderss.com/";


// 扩展API加载完毕后调用onPlusReady回调函数 
document.addEventListener( "plusready", onPlusReady, false );
var r = null; 
// 扩展API加载完毕，现在可以正常调用扩展API 
function onPlusReady() {
	// 获取是否为沉浸式状态栏模式
	var bi = plus.navigator.isImmersedStatusbar();
	console.log('Immersed Statusbar: '+bi?'Yes':'No' );
	
	// 获取系统状态栏高度
	var topheight = plus.navigator.getStatusbarHeight();
	console.log(topheight);
	$(".tabs,.topbar").css("padding-top",topheight);
	//console.log('Statusbar Height: '+lh*plus.screen.scale);
	
	if(plus.device.model == "SM-G955U"){
		$(".device_model").text("设备型号:三星S8+");
	}else if(plus.device.model == "SM-G9500"){
		$(".device_model").text("设备型号:三星S8");
	}else{
		$(".device_model").text("设备型号:"+plus.device.model);
	}
	
	$(".app_version").text("当前版本："+plus.runtime.version);
	
	
	//storage
	if(plus.storage.getItem("is_set_gallery") != "1" ){
		console.log("不保存");
		
		plus.storage.setItem("is_set_gallery", "0");  //默认下载不保存到相册
		$("#switch_gallery").prop("checked",false);
		
	}else{
		console.log("保存");
		$("#switch_gallery").prop("checked",true);
	}
	
	

	

}

//壁纸弹出层
$(document).ready(function(){
    $('.modal').modal({
      dismissible: true, // Modal can be dismissed by clicking outside of the modal
      opacity: .5, // Opacity of modal background
      in_duration: 300, // Transition in duration
      out_duration: 200, // Transition out duration
      starting_top: '4%', // Starting top style attribute
      ending_top: '0%', // Ending top style attribute
      ready: function(modal, trigger) { // Callback for Modal open. Modal and trigger parameters available.
      	
        $img_source = trigger.children('img').attr('content');
        $img_id = trigger.children('img').attr('id');
        $img_meta = trigger.children('img').attr('alt');
        
    

        $(".modal-content .imgsource").append('<a href="#close" class="modal-action modal-close "><img class="img-source cover" src="'+$img_source+'" alt="'+$img_meta+'"> </a> '); 
        $(".modal-content .title").text($img_meta);
/*        $(".img-download").attr("href",$img_source);*/
    
        $(".img-download,.setwallpaper,.lockscreen").attr("imgid",$img_id);
        
        $(".img-download,.setwallpaper,.lockscreen").attr("download",$img_source);
        
        
        $(".down-button").show();
        
        console.log("图片ID:"+ $img_id);
        console.log($img_source);
        mui('.main-view').pullRefresh().endPulldown();

        
      },
      complete: function() {   //关闭弹层，还原
      	$(".modal-content .imgsource").empty(); 
      	$(".img-download").html("下载壁纸");
      	$(".setwallpaper").html("设置壁纸");
      	$(".down-button").hide();  

      	
      	
      	
      
      } // Callback for Modal close
    }
  );
});
    
//菜单
  $(document).ready(function(){

      $('.button-collapse').sideNav({
      menuWidth: 300, // Default is 300
      edge: 'left', // Choose the horizontal origin
      closeOnClick: true, // Closes side-nav on <a> clicks, useful for Angular/Meteor
      draggable: true, // Choose whether you can drag to open on touch screens,
     
  });

//顶部tags导航
  $('ul.tabs').tabs({ 

    onShow: function(tab) {

   $(".tip").remove();
 
	
  // $(".main-view #all .imgbox").remove();

      $tag = tab.prop("id");  //tag ID
		
		console.log("scroll "+plus.storage.getItem("scrolltop"+$tag));
		
  		$(document).scrollTop(Number(plus.storage.getItem("scrolltop"+$tag)));
      $numPage = Number(plus.storage.getItem("totlepage"+$tag)); 
       $nowpage =Number(plus.storage.getItem("nowpage"+$tag)); 
      	console.log($nowpage);
      
    var tag_ele = $(".main-view").children('#'+$tag).children(".imgbox");
    
    if(tag_ele.length == 0) { //分类为空
	    $nowpage =1;  //每次点击tags，初始化页码为1
	    get_new_post($perpage,$nowpage,$tag);
} else{
	   
		console.log("分类不为空");
}
   		console.log(tab.prop("id")); 

 }

});

  });
     

//加载 tags数据

function get_tags(){

  $.ajax({
    url : baseurl+"wp-json/wp/v2/Tags?per_page=30&orderby=count&order=desc",
    type : 'get',
    async : true,

    dataType : 'json',
    success : function(data){

         var tags = eval(data);

         $("ul.tags").append('<li class="tab col s3"><a tagid="0" href="#all" class="">所有壁纸</a></li>');

      $.each(tags,function(i,item){
       $("ul.tags").append('<li class="tab col s3"><a tagid="'+item.id+'" href="#'+item.id+'">'+item.name+'</a></li>');
       
      $(".main-view").append('<div class="row" id="'+item.id+'" style="display:none;"></div>');

      })
    }
  });
}

get_tags();


//获取文章数据
  function get_new_post($perpage,$page,$tag){
  	
  	if($page == 1){
  		plus.storage.setItem("scrolltop"+$tag,"0");
  	}

    if($tag == "all"){
        $(".main-view #all").show();
        req = $.ajax({
	    url : baseurl+"wp-json/wp/v2/posts?per_page="+$perpage+"&page="+$page,
	    type : 'get',
	    async : true,
	    dataType : 'json',
	    success : function(data,status, request){
    	
    
    	mui('.main-view').pullRefresh().endPulldown();
      	$numPage = request.getResponseHeader('X-WP-TotalPages');
      	plus.storage.setItem("totlepage"+$tag,$numPage.toString());  //总页数存储到storage
      	console.log(plus.storage.getItem("totlepage"+$tag));
     	console.log("当前页码"+$page+"当前分类id"+$tag+"总页数"+$numPage);
     	$nowpage = $page;
  		plus.storage.setItem("nowpage"+$tag,$nowpage.toString());  //当前页码存储到storage
     
     	console.log(plus.storage.getItem("nowpage"+$tag));

     	
     	

     	 
      	var posts = eval(data);
         $.each(posts, function(i, item) {
         $.getJSON(baseurl+"wp-json/wp/v2/media/"+item.featured_media,function(media){
            //获取文章ID，封面，标题
            $(".main-view #all").append('<div class="col s4 imgbox"> <a class="modal-trigger" href="#modal"><img id="'+media.id+'" content="'+media.guid.rendered+'" class="popcell z-depth-3 cover" src="'+media.media_details.sizes.thumbnail.source_url+'" alt="'+item.title.rendered+'"></a> </div>');
         
  });

   
  });
         $(".preloader-wrapper").removeClass('active');  // 隐藏加载loading
    },
     error: function(e){    //失败后回调
           console.log("加载错误"+e);
        },
        beforeSend: function(){ 
           $(".preloader-wrapper").addClass('active');  //显示加载loading
        }
  });

    }else{
    $(".main-view #all").hide();
   req = $.ajax({
    url : baseurl+"wp-json/wp/v2/posts?per_page="+$perpage+"&page="+$page+"&tags="+$tag,
    type : 'get',
    async : true,
    dataType : 'json',
    success : function(data,status, request){ 

	mui('.main-view').pullRefresh().endPulldown();
      	$numPage = request.getResponseHeader('X-WP-TotalPages');
      	$nowpage = $page;
     	console.log("当前页码"+$page+"当前分类id"+$tag+"总页数"+$numPage);
		plus.storage.setItem("totlepage"+$tag,$numPage.toString());  //总页数存储到storage
      	console.log(plus.storage.getItem("totlepage"+$tag));
      	  	$nowpage = $page;
  	plus.storage.setItem("nowpage"+$tag,$nowpage.toString());  //当前页码存储到storage
     
     	console.log(plus.storage.getItem("nowpage"+$tag));
     
     
      var posts = eval(data);
         $.each(posts, function(i, item) {
          $.getJSON(baseurl+"wp-json/wp/v2/media/"+item.featured_media,function(media){
            //获取文章ID，封面，标题
            $(".main-view #"+$tag).append('<div class="col s4 imgbox"> <a class="modal-trigger" href="#modal"><img id="'+media.id+'" content="'+media.guid.rendered+'" class="popcell z-depth-3 cover" src="'+media.media_details.sizes.thumbnail.source_url+'" alt="'+item.title.rendered+'"></a> </div>');
         
  });

   
  });
         $(".preloader-wrapper").removeClass('active');  // 隐藏加载loading
    },
     error: function(e){    //失败后回调
            console.log("加载错误"+e);
          
        },
        beforeSend: function(){ 
           $(".preloader-wrapper").addClass('active');  //显示加载loading
        }
  });

    }


}
 



//判断滚动条是否滑到底部  
   function checkScrollDirector(){      
        var flag=0; 
		if(window.innerHeight + $(document).scrollTop() >= document.body.scrollHeight){
       flag=1;  
    }
        return flag;           
        }  

    window.onscroll=function(){           //滚动条滚动执行翻页加载  
    		$scrolltop  = $(document).scrollTop();
    		
    		plus.storage.setItem("scrolltop"+$tag,$scrolltop.toString());
            
            if(checkScrollDirector()){ 
            if($nowpage < $numPage){
              get_new_post($perpage,++$nowpage,$tag); 
              console.log("第"+$nowpage+"页");
            }else{
              console.log("到底了！");
              $(".tip").remove();
              $(".main-view").append('<p class="tip">没有更多了~~</p>');  
            }
               
                
            }  
        } 



$(function(){
	$(".update").click(function(){
		plus.runtime.openURL(updateurl);
		
		
	})
})

//is_set_gallery控制
$(function(){
	$("#switch_gallery").click(function(){
		if($("#switch_gallery").is(':checked')){
			plus.storage.setItem("is_set_gallery", "1");
			console.log("已打开开关");
			
		}else{
			plus.storage.setItem("is_set_gallery", "0");
		}
	});
});





mui.init({
  pullRefresh : {
    container:".main-view",//下拉刷新容器标识，querySelector能定位的css选择器均可，比如：id、.class等
    down : {
      style:'circle',//必选，下拉刷新样式，目前支持原生5+ ‘circle’ 样式
      color:'#2BD009', //可选，默认“#2BD009” 下拉刷新控件颜色
      height:'50px',//可选,默认50px.下拉刷新控件的高度,
      range:'100px', //可选 默认100px,控件可下拉拖拽的范围
      offset:'0px', //可选 默认0px,下拉刷新控件的起始位置
      auto: true,//可选,默认false.首次加载自动上拉刷新一次
      callback :pullfreshcallbak //必选，刷新函数，根据具体业务来编写，比如通过ajax从服务器获取新数据；
    }
  }
});

function pullfreshcallbak(){
	
	if($(".pop-div .modal").is(":hidden")){
		console.log("下拉刷新");
		$(".tip").remove();
		$(".main-view").children('#'+$tag).children(".imgbox").remove();
		$nowpage =1;  //每次点击tags，初始化页码为1
		get_new_post($perpage,$nowpage,$tag);
		
	}
	
	mui('.main-view').pullRefresh().endPulldown();

} 

/*function local_file(local_img){


	plus.io.resolveLocalFileSystemURL(local_img, function(entry){
			entry.file(function(file){
				console.log("文件存在本地！");
				
				setwallpaper(local_img);
				
				
			});
				    },
				    function(e){ //错误
				    	setwallpaperDownload();
						console.log(e.message);
				    }
);	


}
*/

//判断图片是否存在,存在就无需下载
function is_exist($d_ID){
		var flag=0;
			 $(".img-download").addClass("disabled");
		 for(var i=0;i<plus.storage.getLength();i++){
	 		if("file"+$d_ID == plus.storage.key(i)){
	 		
	 			var local_img = plus.storage.getItem(plus.storage.key(i));  //查找值，即图片ID键对应的本地路径
	 			flag =1;
	 			plus.nativeUI.toast( "已下载！",{duration:'short'});
	 			 $(".img-download").removeClass("disabled");
	 			break;
			
	 	}
	 	
	 	
	 }
		 
	
	return flag;
		
}


//判断图片是否存在,存在就无需下载,直接设置壁纸
function is_exist2($d_ID){
 var flag=0;  
	 $(".setwallpaper").text("应用中...");
	 $(".setwallpaper").addClass("disabled");
		 for(var i=0;i<plus.storage.getLength();i++){
		 	
	 		if("file"+$d_ID == plus.storage.key(i)){
		 		console.log("图片ID已存在");
		 		var local_img = plus.storage.getItem(plus.storage.key(i));  //查找值，即图片ID键对应的本地路径
		 			setwallpaper(local_img);
		 		flag =1;
		 		break;
		
	 	}
	 	
	 	
	 }
		 
		 	return flag;
		
}



//判断图片是否存在,存在就无需下载,直接设置锁屏
function is_exist3($d_ID){
	 var flag=0;  
	 var local_img = "";
	 	$(".lockscreen").text("应用中...");
	 		 $(".lockscreen").addClass("disabled");
		 for(var i=0;i<plus.storage.getLength();i++){
		 	
	 		if("file"+$d_ID == plus.storage.key(i)){
		 		console.log("图片ID已存在");
		 		local_img = plus.storage.getItem(plus.storage.key(i));  //查找值，即图片ID键对应的本地路径
		 		setlockwallpaper(local_img);
				flag = 1;
				break;
	 	}
	 	
	 		
	 }
		 
		 	return flag;
	
}

//下载模块
 
$(function(){
	 $(".img-download").click(function(){
	 	var d_url = $(".img-download").attr("download");
	 	getfileID = $(".img-download").attr("imgid");  //保存当前的文件ID
	 	console.log(getfileID);
	 	console.log("本地数据 "+plus.storage.getLength());
	 	
 	if(!is_exist(getfileID)){
	 		console.log("图片不存在");
	 		createDownload(d_url);
	 		
	 	}
	 
	 });
});



//设置壁纸调用

$(function(){
	 $(".setwallpaper").click(function(){
	 	var $wallpaper = $(".setwallpaper").attr("download");
	 		getfileID = $(".img-download").attr("imgid");  //保存当前的文件ID
	 		console.log(getfileID);
	 		console.log("本地数据 "+plus.storage.getLength());
	 	 	
	 	 	
	 	 	if(!is_exist2(getfileID)){
	 			console.log("图片ID不存在");
	 			setwallpaperDownload($wallpaper,0);  //设置壁纸前的下载缓存，0为 设置壁纸标志
	 		
	 	}else{
	 		console.log("图片ID存在");
	 		
	 		
	 	}

	 	
	 });
});

//设置锁屏

$(function(){
	$(".lockscreen").click(function(){
		var $lockscreen = $(".lockscreen").attr("download");
			getfileID = $(".img-download").attr("imgid");  //保存当前的文件ID
	 		console.log(getfileID);
	 		console.log("本地数据 "+plus.storage.getLength());
	 		
		
		
			if(!is_exist3(getfileID)){
	 			console.log("图片ID不存在");
	 			setwallpaperDownload($lockscreen,1);  //设置壁纸前的下载缓存，1为设置锁屏标志
	 		
	 	}
			
			
		
		
	});
});

// 监听下载任务状态 
function onStateChanged( download, status ) {
	
	
	if ( download.state == 3 && status == 200 ) {
		// 下载完成 
		$(".img-download").text("正在下载");
	
	}
		
	if ( download.state == 4 && status == 200 ) { 
		// 下载完成 
		var MB_size = download.downloadedSize/1024/1024; 
		MB_size = parseFloat(MB_size.toFixed(2)); 
		$(".img-download").text("下载完成("+MB_size+"MB)");
		plus.storage.setItem("file"+getfileID,download.filename);
		$(".img-download").removeClass("disabled");
		
		savePicture(download.filename);
	
	
		
		
		
		
	}
}

// 创建下载任务
function createDownload($d_url) {

	var dtask = plus.downloader.createDownload( $d_url, {}, function ( d, status ) {
		// 下载完成
		if ( status != 200 ) {
			 alert( "下载失败: " + status ); 
		}  
	});
	dtask.addEventListener( "statechanged", onStateChanged, false );
	dtask.start(); 
}

//设置壁纸，锁屏前的下载缓存

function setwallpaperDownload($wallpaper_url,$flg) {

	var dtask = plus.downloader.createDownload( $wallpaper_url, {}, function ( d, status ) {
		// 下载完成
		if ( status == 200 && $flg== 0) {
			 plus.storage.setItem("file"+getfileID,d.filename);  //保存到storage中
			 setwallpaper(d.filename);  //调用设置壁纸功能
			// savePicture(d.filename);
		
			
		}else if(status == 200 && $flg== 1){
			plus.storage.setItem("file"+getfileID,d.filename);  //保存到storage中
			 setlockwallpaper(d.filename);  //调用设置锁屏功能
			// savePicture(d.filename);
		
		}
		else{
			alert( "设置失败: " + status ); 
		}
	});
	
	dtask.start(); 
}

// 保存图片到相册中 
function savePicture($img_temp) {
	
	if(plus.storage.getItem("is_set_gallery") == "1"){
			plus.gallery.save($img_temp , function () {
			console.log("已保存至相册");
			plus.nativeUI.toast( "已下载到至相册中");
	} );
	}

	
	
	
	
}

//设置壁纸
function setwallpaper($wallpaper_url){
  var $img_download =	$(".setwallpaper").attr("download");

	plus.io.resolveLocalFileSystemURL($wallpaper_url, function(entry){
			entry.file(function(file){
				console.log("文件存在本地！");
				
				
				
    var WallpaperManager = plus.android.importClass("android.app.WallpaperManager");
    //获取应用主activity实例对象
    var Main = plus.android.runtimeMainActivity();
    var wallpaperManager = WallpaperManager.getInstance(Main);
    plus.android.importClass(wallpaperManager);
    var BitmapFactory = plus.android.importClass("android.graphics.BitmapFactory");
    var url=$wallpaper_url;  // 换成要设置的壁纸图片路径
    
    //将本地URL路径转换成平台绝对路径,如url为“_doc/a.png”： Android平台转换后的路径为“/storage/sdcard0/Android/data/io.dcloud.HBuilder/.HBuilder/apps/HBuilder/doc/ａ.png”
    var path=plus.io.convertLocalFileSystemURL(url);
    //解析图片文件并创建对应的Bitmap对象
    var bitmap = BitmapFactory.decodeFile(path);
    try{
        wallpaperManager.setBitmap(bitmap);
       
       	 plus.nativeUI.toast( "设置成功,返回桌面查看");
			 $(".setwallpaper").text("设为壁纸");
			 	 $(".setwallpaper").removeClass("disabled");
			 
			 
      
        bitmap.recycle(); // 设置完毕桌面要进行 原生层的BITMAP回收 减少内存压力
        
    }catch(e){
        //TODO handle the exception
       
    }		
			});
				    },
				    function(e){ //文件路径没有找到文件
				    	setwallpaperDownload($img_download,0);
						console.log(e.message);
				    }
);	

}

//设置锁屏壁纸
function setlockwallpaper($wallpaper_url){
	  var $img_download =	$(".lockscreen").attr("download");

	plus.io.resolveLocalFileSystemURL($wallpaper_url, function(entry){
			entry.file(function(file){
				console.log("文件存在本地！");
				
	
    var WallpaperManager = plus.android.importClass("android.app.WallpaperManager");
    //获取应用主activity实例对象
    var Main = plus.android.runtimeMainActivity();
    var wallpaperManager = WallpaperManager.getInstance(Main);
    plus.android.importClass(wallpaperManager);
    var BitmapFactory = plus.android.importClass("android.graphics.BitmapFactory");
    var url=$wallpaper_url;  // 换成要设置的壁纸图片路径
    
    //将本地URL路径转换成平台绝对路径,如url为“_doc/a.png”： Android平台转换后的路径为“/storage/sdcard0/Android/data/io.dcloud.HBuilder/.HBuilder/apps/HBuilder/doc/ａ.png”
    var path=plus.io.convertLocalFileSystemURL(url);
    //解析图片文件并创建对应的Bitmap对象
    var bitmap = BitmapFactory.decodeFile(path);
    try{
    
        wallpaperManager.setBitmap(bitmap, null, true, WallpaperManager.FLAG_LOCK);
        
        	 plus.nativeUI.toast( "设置成功,返回桌面查看");
			 $(".lockscreen").text("设为锁屏");
			  $(".lockscreen").removeClass("disabled");
      
        bitmap.recycle(); // 设置完毕桌面要进行 原生层的BITMAP回收 减少内存压力
        
    }catch(e){
        //TODO handle the exception
    }
    
    			});
				    },
				    function(e){ //文件路径没有找到文件
				    	setwallpaperDownload($img_download,1);
						console.log(e.message);
				    }
);	



}
