var api="https://zm.armoe.cn"
var checkIntervalId;
var cookie;
var userdata = {"avatarUrl":"","nickname":"","uid":""};
var musiclist=[];
var alternativemusiclist=[];
var addstart=null;
var addend=null;
var currentmusic=0;
var music = new Audio();
var extra = "";
var sorting = "sort";
var loadstate = false;
var stopstate = false;
var lyricdict = {};
var lyrictrans = {};
music.pause();
mouseX = 0;
mouseY = 0;

function init() {
    setloading();
    cookie = localStorage.getItem("cookie");
    if (cookie != null) {
        extra = "&cookie=" + cookie;
        getuser();
        
    }
    
    setTimeout(function() {
        init2();
    }, 1000);
    initProgressBar();
}
function init2(){
    if(cookie==null){
        console.log("no cookie")
    }
    if(cookie!=null){
        document.getElementById("avatar").src=userdata.avatarUrl;
        document.getElementById("username").innerHTML=userdata.nickname;
        addcontentelementsmooth("imgs/celia.jpg","每日推荐","postrecommendsongs()")
        getrecommendlist();
    }
    loadpast();
    console.log("initialized")
}
function savenow(){
    if(loadstate==false){
        return;
    }
    localStorage.setItem("src",music.src);
    localStorage.setItem("progress",music.currentTime);
    localStorage.setItem("musicindex",currentmusic);
    localStorage.setItem("musiclist",JSON.stringify(musiclist));
    localStorage.setItem("musiccover",document.getElementById("song-img").src);
    localStorage.setItem("musicname",document.getElementById("song-name").innerHTML);
    localStorage.setItem("musicartist",document.getElementById("song-artist").innerHTML);
}
function loadpast(){
    music.src=localStorage.getItem("src");
    music.currentTime=localStorage.getItem("progress");
    currentmusic=localStorage.getItem("musicindex");
    musiclist=JSON.parse(localStorage.getItem("musiclist"));
    document.getElementById("song-img").src=localStorage.getItem("musiccover");
    document.getElementById("song-name").innerHTML=localStorage.getItem("musicname");
    document.getElementById("song-artist").innerHTML=localStorage.getItem("musicartist");
    loadstate=true;
}
function setloading(){
    console.log("loading")
    var loading=document.getElementById("loading-screen");
    var loadingtext=document.getElementById("loading-text");
    xmxl=new XMLHttpRequest();
    xmxl.open("POST","https://v1.hitokoto.cn/?c=a&c=b&c=c&c=d",true);
    xmxl.send();
    xmxl.onreadystatechange=function(){
        if(xmxl.readyState==4 && xmxl.status==200){
            var index=0;
            var text=[]
            var data=JSON.parse(xmxl.responseText);
            for(var i=0;i<data.hitokoto.length;i++){
                setTimeout(function(){
                    text.push(data.hitokoto[index]);
                    loadingtext.innerHTML=text.join("");
                    index++;
                },i*70);
            }
        }
    }
    setTimeout(function(){
        loading.style.opacity=0;
        setTimeout(function(){
            loading.style.display="none";
        },1000);
    },2000);
    
}
//检测回车按下
document.addEventListener("keydown", function(event) {
    if (event.key === "Enter") {
        search();
    }
})

function info(info,staytime){
    var infobox=document.getElementById("info-box");
    infobox.innerHTML=info;
    infobox.style.transform="scale(1)"; 
    setTimeout(function(){
        infobox.style.transform="scale(0)";
    },staytime);
}
function lightmode(){
    //为所有container添加light类
    var containers=document.getElementsByClassName("container");
    for(var i=0;i<containers.length;i++){
        containers[i].classList.add("light");
    }
    
}

function confirm(text,callback){
    var confirmtext = document.getElementById("check-content");
    var confirmyes = document.getElementById("check-yes");
    confirmtext.innerHTML=text;
    confirmyes.setAttribute("onclick",callback);
    openconfirm();
}
function openconfirm(){
    var confirmbox=document.getElementById("check-box");
    confirmbox.style.transform="scale(1)";
}
function closeconfirm(){
    var confirmbox=document.getElementById("check-box");
    confirmbox.style.transform="scale(0)";
}

function switchsection(section){
    var sec1=document.getElementById("section1");
    var sec2=document.getElementById("section2");
    if(section==0){
        sec1.style.left=0;
        sec2.style.left="calc(100% + 10px)";
    }
    if(section==1){
        sec1.style.left="calc(-100% - 30px)";
        sec2.style.left=0; 
    }
}

function smoothstop(){
    stopstate=true;
    var savevalue=music.volume;
   for(var i=music.volume*100;i>=0;i++){
       setTimeout(function(){
           music.volume = i / 100;
       },i*10);
   }
   music.pause();
   document.getElementById("play-button").src="imgs/play_light.png";
   music.volume=savevalue;
   stopstate=false;
}

function addsidebarelement(icon,text,click){
    var sidebar=document.getElementById("sidebar");
    var element=document.createElement("div");
    var elementicon=document.createElement("div");
    var elementimg=document.createElement("img");
    var elementinfo=document.createElement("div");
    element.className="sidebar-element";
    elementicon.className="sidebar-element-img";
    elementimg.src=icon;
    elementinfo.className="sidebar-element-info";
    elementinfo.innerHTML=text;
    element.setAttribute("onclick",click);
    elementicon.appendChild(elementimg);
    element.appendChild(elementicon);
    element.appendChild(elementinfo);
    element.onclick=onclick;
    sidebar.appendChild(element);
}
function addsidebarelementsmooth(icon,text,click){
    var sidebar=document.getElementById("sidebar");
    var element=document.createElement("div");
    var elementicon=document.createElement("div");
    var elementimg=document.createElement("img");
    var elementinfo=document.createElement("div");
    element.className="sidebar-element";
    elementicon.className="sidebar-element-img";
    elementimg.src=icon;
    elementinfo.className="sidebar-element-info";
    elementinfo.innerHTML=text;
    elementicon.appendChild(elementimg);
    element.appendChild(elementicon);
    element.appendChild(elementinfo);
    element.setAttribute("onclick",click);
    element.style.transform="translatex(-100%)";
    setTimeout(function(){
        element.style.transform="translatex(0)";
    },100);
    sidebar.appendChild(element);
}
function dev(){
    console.log("dev------------");
    for(var i=0;i<10;i++){
        setTimeout(function(){
            addcontentelementsmooth("imgs/logo.png","test") 
        },100*i);
    }
}
function addcontentelement(img,info,click){
    var content=document.getElementById("content");
    var element=document.createElement("div");
    var elementimg=document.createElement("img");
    var elementinfo=document.createElement("div");
    element.className="content-element";
    elementimg.src=img;
    elementinfo.className="content-element-info";
    elementinfo.innerHTML=info;
    element.setAttribute("onclick",click);
    element.appendChild(elementimg);
    element.appendChild(elementinfo);
    content.appendChild(element);
}
function addcontentelementsmooth(img,info,click){
    var content=document.getElementById("content");
    var element=document.createElement("div");
    var elementimg=document.createElement("img");
    var elementinfo=document.createElement("div");
    element.className="content-element";
    elementimg.src=img;
    elementinfo.className="content-element-info";
    elementinfo.innerHTML=info;
    element.setAttribute("onclick",click);
    element.appendChild(elementimg);
    element.appendChild(elementinfo);
    element.style.transform="scale(0)";
    setTimeout(function(){
        element.style.transform="scale(1)";
    },100);
    content.appendChild(element);
}
function addlistelement(img,name,artist,click){
    var list=document.getElementById("list-body");
    var element=document.createElement("div");
    var elementimg=document.createElement("img");
    var elementinfo=document.createElement("div");
    var elementname=document.createElement("div");
    var elementartist=document.createElement("div");
    element.className="list-element";
    elementimg.src=img;
    elementinfo.id="list-element-info";
    elementname.id="list-element-name";
    elementartist.id="list-element-artist";
    elementname.innerHTML=name;
    elementartist.innerHTML=artist;
    elementinfo.appendChild(elementname);
    elementinfo.appendChild(elementartist);
    element.setAttribute("onclick",click);
    element.appendChild(elementimg);
    element.appendChild(elementinfo);
    list.appendChild(element);
}
function addlistelementsmooth(img,name,artist,click,elementid){
    var list=document.getElementById("list-body");
    var element=document.createElement("div");
    var elementimg=document.createElement("img");
    var elementinfo=document.createElement("div");
    var elementname=document.createElement("div");
    var elementartist=document.createElement("div");
    var addbtn=document.createElement("img");
    element.className="list-element";
    elementimg.src=img;
    elementimg.setAttribute("id",elementid);
    elementinfo.id="list-element-info";
    elementname.id="list-element-name";
    elementartist.id="list-element-artist";
    addbtn.src="imgs/addtolist_light.png";
    addbtn.setAttribute("onclick","addtolist("+elementid+")");
    addbtn.setAttribute("class","add-to-list-button");
    addbtn.setAttribute("id","add-to-list-button");
    addbtn.addEventListener("click",function(e){
        e.stopPropagation();
        addbtn.style.transform = "scale(0)"
        setTimeout(function(){
            addbtn.style.transform = "scale(1)"
            
        },1000)
    })
    elementname.innerHTML=name;
    elementartist.innerHTML=artist;
    elementinfo.appendChild(elementname);
    elementinfo.appendChild(elementartist);
    element.setAttribute("onclick",click);
    element.setAttribute("id",elementid);
    element.appendChild(elementimg);
    element.appendChild(elementinfo);
    element.appendChild(addbtn);
    list.appendChild(element);
    element.style.transform="scale(0)";
    setTimeout(function(){
        element.style.transform="scale(1)";
    },100);
    element.classList.add("zoom");
}
function parselyric(songid){
    var lyricdict={};
    var xmxl=new XMLHttpRequest();
    xmxl.open("GET",api+"/lyric?id="+songid,true);
    xmxl.send();
    xmxl.onreadystatechange=function(){
        if(xmxl.readyState==4 && xmxl.status==200){
            var data=JSON.parse(xmxl.responseText);
            var lyric=data.lrc.lyric; 
            var lyrictranss=data.tlyric.lyric;
            var lyricarr=lyric.split("\n");
            var lyrictransarr=lyrictranss.split("\n");
            for(var i=0;i<lyricarr.length;i++){

                var time=lyricarr[i].split("]")[0].substring(1);
                var text=lyricarr[i].split("]")[1];
                //translate time to seconds
                var timearr=time.split(":");
                var time=parseInt(timearr[0])*60+parseFloat(timearr[1]);
                //persize to 0.1
                time=Math.round(time*10)/10;
                //add to dict
                lyricdict[time]=text;
            }
            for(var i=0;i<lyrictransarr.length;i++){
                var time=lyrictransarr[i].split("]")[0].substring(1);
                var text=lyrictransarr[i].split("]")[1];
                //translate time to seconds
                var timearr=time.split(":");
                var time=parseInt(timearr[0])*60+parseFloat(timearr[1]);
                //persize to 0.1
                time=Math.round(time*10)/10;
                //add to dict
                lyrictrans[time]=text;
            }
        }
    }
    return lyricdict;
}

function lyricload(){
    if(lyricdict==null){
        return;
    }
    //persize currenttime to 0.1
    mtime=Math.round(music.currentTime*10)/10;
    if(lyricdict[mtime]!=undefined){
        console.log(lyricdict[mtime] + "|" + lyrictrans[mtime]);
    }
}
function addtolist(songid){
    if(addstart==null){
        addstart=currentmusic;
        addend=currentmusic+1;
        musiclist.splice(currentmusic+1,0,songid);
    }
    else{
        musiclist.splice(addend+1,0,songid);
        addend++;
    }
}
function checkadd(){
    if(addstart!=null){
        if(addstart>currentmusic || addend<currentmusic){
            addstart=null;
            addend=null;
        }
    }
}
function checkcurrent(){
    songs = document.getElementsByClassName("list-element");
    for (var i = 0; i < songs.length; i++) {
        if(songs[i].id==musiclist[currentmusic]){
            songs[i].classList.add("current");
        }
        else{
            songs[i].classList.remove("current");
        }
    }
}
function musicplay(){
    if(music.src==''){
        if(currentmusic == 0 && musiclist.length>0){
            postmusic(musiclist[currentmusic])
        }
        else{
            return;
        }
    }
   else if(music.paused){
        console.log("play");
        if(music.src!=null){
            music.play();
            document.getElementById("play-button").src="imgs/pause_light.png"; 
        }
   } 
   else if(!music.paused){
        console.log("pause");
        music.pause();
        document.getElementById("play-button").src="imgs/play_light.png"; 
   }
}
function musicplayy(){
    console.log("play");
    music.play();
    document.getElementById("play-button").src="imgs/pause_light.png"; 
}
function musicpausee(){
    console.log("pause");
    music.pause();
    document.getElementById("play-button").src="imgs/play_light.png"; 
}
function musicnext(){
    if(musiclist.length==0){
        return;
    }
    if(sorting=="random"){
        var randommusic=Math.floor(Math.random()*musiclist.length);
        postmusic(musiclist[randommusic]);
        currentmusic=randommusic;
        musicplayy(); 
    }
    else if(sorting=="sort"){
        if(currentmusic<musiclist.length-1){
            currentmusic++;
            postmusic(musiclist[currentmusic]);
            musicplayy();
        }
        else{
            currentmusic=0;
            postmusic(musiclist[currentmusic]);
            musicplayy();
        } 
    }
}
function musicprev(){
    if(musiclist.length==0){
        return;
    }
    if(sorting=="random"){
        var randommusic=Math.floor(Math.random()*musiclist.length);
        postmusic(musiclist[randommusic]);
        currentmusic=randommusic;
        musicplayy();
    }
    else if(sorting=="sort"){
        if(currentmusic>0){
            currentmusic--;
            postmusic(musiclist[currentmusic]);
            musicplayy();
        } 
        else{
            currentmusic=musiclist.length-1;
            postmusic(musiclist[currentmusic]);
            musicplayy(); 
        }
    }
}
function switchsort(){
    if(sorting=="sort"){
        sorting="random";
        document.getElementById("sort-switch").src="imgs/random_light.png";
    }
    else if(sorting=="random"){
        sorting="loop";
        document.getElementById("sort-switch").src="imgs/loop_light.png"; 
    }
    else if(sorting=="loop"){
        sorting="sort";
        document.getElementById("sort-switch").src="imgs/sort_light.png"; 
    }
}
function updateprogress(){
    var duration=document.getElementById("duration");
    var progress=document.getElementById("progress");
    var progressbarinner=document.getElementById("progress-bar-inner");
    progress.style.width="calc(" + music.currentTime/music.duration*100+"%" + " + 10px)";
    progressbarinner.style.left=music.currentTime/music.duration*100+"%";
    var currentminutes=Math.floor(music.currentTime/60);
    var currentseconds=Math.floor(music.currentTime%60);
    var durationminutes=Math.floor(music.duration/60);
    var durationseconds=Math.floor(music.duration%60);
    if(currentminutes<10){
        currentminutes="0"+currentminutes;
    }
    if(currentseconds<10){
        currentseconds="0"+currentseconds;
    }
    if(durationminutes<10){
        durationminutes="0"+durationminutes;
    }
    if(durationseconds<10){
        durationseconds="0"+durationseconds;
    }
    duration.innerHTML=currentminutes+":"+currentseconds+" / "+durationminutes+":"+durationseconds;
}
function updatevolume(){
    if(stopstate==false){
        var volume=document.getElementById("volume-slider");
        if(volume.value==0){
            document.getElementById("volume-button").src="imgs/mute_light.png";
        }
        else if(volume.value<50){
            document.getElementById("volume-button").src="imgs/volume_small_light.png";
        }
        else if(volume.value>=50){
            document.getElementById("volume-button").src="imgs/volume_big_light.png"; 
        }
        music.volume=volume.value/100;
    }
    else{
        return;
    }
}

function setprogress(event) {
    var progress = document.getElementById("progress");
    var progressbar = document.getElementById("progress-bar");
    var progressWidth = progressbar.offsetWidth;
    var clickX = event.clientX - progressbar.getBoundingClientRect().left;
    var progressPercentage = (clickX / progressWidth) * 100;

    // 限制进度在0%到100%之间
    if (progressPercentage < 0) progressPercentage = 0;
    if (progressPercentage > 100) progressPercentage = 100;

    // 更新进度条和音乐进度
    progress.style.width = progressPercentage + "%";
    music.currentTime = (progressPercentage / 100) * music.duration;
}

function initProgressBar() {
    var progressbar = document.getElementById("progress-bar");
    var progressbarinner = document.getElementById("progress-bar-inner");

    // 添加鼠标按下事件
    progressbarinner.addEventListener("mousedown", function(event) {
        event.preventDefault();
        function onMouseMove(event) {
            setprogress(event);
        }

        function onMouseUp() {
            document.removeEventListener("mousemove", onMouseMove);
            document.removeEventListener("mouseup", onMouseUp);
        }
        document.addEventListener("mousemove", onMouseMove);
        document.addEventListener("mouseup", onMouseUp);
    });
    progressbar.addEventListener("click", setprogress);
}
document.addEventListener("mousemove", function(event) {
    mouseX = event.clientX;
    mouseY = event.clientY;
});

//检测当shift按下并且鼠标指针位于listelement上时，放大listelement
document.addEventListener("keydown", function(event) {
    if (event.key === "Shift") {
        var listelement = document.getElementById("list-body").getElementsByClassName("list-element");
        for (var i = 0; i < listelement.length; i++) {
            if (mouseX >= listelement[i].getBoundingClientRect().left && mouseX <= listelement[i].getBoundingClientRect().right && mouseY >= listelement[i].getBoundingClientRect().top && mouseY <= listelement[i].getBoundingClientRect().bottom) {
                listelement[i].style.transform = "scale(1.1)"; 
            } 
            else {
                listelement[i].style.transform = "scale(1)";
            }
        }
    }  
})
document.addEventListener("keyup", function(event) {
    if (event.key === "Shift") {
        var listelement = document.getElementById("list-body").getElementsByClassName("list-element");
        for (var i = 0; i < listelement.length; i++) {
            listelement[i].style.transform = "scale(1)";
        }
    }
})

function addtest(){
    //获取所有id为add-to-list-button的元素
    var buttonlist = document.getElementsByClassName("add-to-list-button");
    console.log(buttonlist);
    for (var i = 0; i < buttonlist.length; i++) {
        buttonlist[i].addEventListener("click", function(event) {
            event.stopPropagation();
        });
    }
}



function postmusic(songid){
    lyricdict=parselyric(songid);
    var artists=[];
    var musicname=document.getElementById("song-name");
    var musicauthor=document.getElementById("song-artist");
    var musiccover=document.getElementById("song-img");
    xml = new XMLHttpRequest();
    xml.open("POST", api+"/song/detail?ids="+songid+extra, true);
    xml.send();
    xml.onreadystatechange = function() {
        if (xml.readyState == 4 && xml.status == 200) {
            res = JSON.parse(xml.responseText);
            musicname.innerHTML=res.songs[0].name;
            for(var i=0;i<res.songs[0].ar.length;i++){
                artists.push(res.songs[0].ar[i].name);
            }
            musicauthor.innerHTML=artists.join(", ");
            musiccover.src=res.songs[0].al.picUrl;
            
        }
    }
    xmll = new XMLHttpRequest();
    xmll.open("POST", api+"/song/url?id="+songid+extra, true);
    xmll.send();
    xmll.onreadystatechange = function() {
        if (xmll.readyState == 4 && xmll.status == 200) {
            res = JSON.parse(xmll.responseText);
            music.src=res.data[0].url;
        }
    }
    setTimeout(function(){
        musicplayy();
    },500)
}
function postlistmusic(songid){
    lyricdict=parselyric(songid);
    var tmp;
    var artists=[];
    var musicname=document.getElementById("song-name");
    var musicauthor=document.getElementById("song-artist");
    var musiccover=document.getElementById("song-img");
    for(var i=0;i<alternativemusiclist.length;i++){
        if(alternativemusiclist[i]-songid == 0){
            currentmusic=i;
            musiclist = alternativemusiclist;
            tmp = true;
        }
    }
    if(!tmp){
        alternativemusiclist = [];
        musiclist = [];
    }
    xml = new XMLHttpRequest();
    xml.open("POST", api+"/song/detail?ids="+songid+extra, true);
    xml.send();
    xml.onreadystatechange = function() {
        if (xml.readyState == 4 && xml.status == 200) {
            res = JSON.parse(xml.responseText);
            musicname.innerHTML=res.songs[0].name;
            if(musicname.offsetWidth<400&&res.songs[0].name.length>10){
                musicname.style.animation="marquee 10s linear infinite"
            }
            else{
                musicname.style.animation="none";
            }
            for(var i=0;i<res.songs[0].ar.length;i++){
                artists.push(res.songs[0].ar[i].name);
            }
            musicauthor.innerHTML=artists.join(", ");
            musiccover.src=res.songs[0].al.picUrl;
            
        }
    }
    xmll = new XMLHttpRequest();
    xmll.open("POST", api+"/song/url?id="+songid+extra, true);
    xmll.send();
    xmll.onreadystatechange = function() {
        if (xmll.readyState == 4 && xmll.status == 200) {
            res = JSON.parse(xmll.responseText);
            music.src=res.data[0].url;
        }
    }
    setTimeout(function(){
        musicplayy();
    },500)
}
function postrecommendsongs(){
    //clear list
    var list=document.getElementById("list-body");
    while (list.firstChild) {
        list.removeChild(list.firstChild);
    }
    alternativemusiclist=[];
    switchsection(1);
    document.getElementById("list-name").innerHTML="每日推荐";
    document.getElementById("list-info").innerHTML="每日推荐歌曲列表";
    document.getElementById("list-img").src="imgs/celia.jpg";
    xml = new XMLHttpRequest();
    xml.open("POST", api+"/recommend/songs?limit=100"+extra, true);
    xml.send();
    xml.onreadystatechange = function() {
        if (xml.readyState == 4 && xml.status == 200) {
            res = JSON.parse(xml.responseText);
            for(var i=0;i<res.data.dailySongs.length;i++){
                var artists=[];
                alternativemusiclist.push(res.data.dailySongs[i].id);
                for(var j=0;j<res.data.dailySongs[i].ar.length;j++){
                    artists.push(res.data.dailySongs[i].ar[j].name);
                }
                artist = artists.join(", ");
                addlistelementsmooth(res.data.dailySongs[i].al.picUrl,res.data.dailySongs[i].name,artist,"postlistmusic("+res.data.dailySongs[i].id+")",res.data.dailySongs[i].id);
            }
        }
    }
}

function logintmp(){
    localStorage.removeItem('cookie');cookie=null;closeconfirm();init();
}
function login(mode){
    if(cookie!=null){
        confirm("已登录,是否登出?","logintmp()");
    }
    else if(mode=="qrcode"){
        document.getElementById("login-box").style.transform="scale(1)";
        var cookiee;
        var uk;
        var imgb64;
        xml = new XMLHttpRequest();
        xml.withCredentials = true;
        xml.open("GET", api+"/login/qr/key", true);
        xml.send();
        xml.onreadystatechange = function() {
            if (xml.readyState == 4 && xml.status == 200) {
                var res = JSON.parse(xml.responseText);
                uk = res.data.unikey;
                xmll = new XMLHttpRequest();
                setTimeout(function(){
                    var qrimg = document.getElementById("qrimg");
                    xmll.withCredentials = true;
                    xmll.open("GET", api+"/login/qr/create?key="+uk+"&qrimg=true", true);
                    xmll.send();
                    xmll.onreadystatechange = function() {
                    if (xmll.readyState == 4 && xmll.status == 200) {
                            var ress = JSON.parse(xmll.responseText);
                            imgb64 = ress.data.qrimg;
                            qrimg.src = imgb64;
                        }
                    }
                },1000);
                // 保存setInterval的ID
                checkIntervalId = setInterval(function(){
                    console.log("checking")
                    xmlll = new XMLHttpRequest();
                    xmlll.withCredentials = true;
                    xmlll.open("POST", api+"/login/qr/check?key="+uk, true); 
                    xmlll.send();
                    xmlll.onreadystatechange = function() {
                        if (xmlll.readyState == 4 && xmlll.status == 200) {
                            if(JSON.parse(xmlll.responseText).code==800){
                                console.log("已过期")
                                clearInterval(checkIntervalId);
                                document.getElementById("login-box").style.transform="scale(0)";
                                info("二维码已过期,请稍后再试",1000);
                            }
                            if(JSON.parse(xmlll.responseText).code==801){
                                console.log("未扫码")
                            }
                            if(JSON.parse(xmlll.responseText).code==800){
                                console.log("TIMEOUT")
                            }
                            if(JSON.parse(xmlll.responseText).code==803){
                                resss=JSON.parse(xmlll.responseText);
                                console.log("已登录")
                                cookiee = resss.cookie;
                                localStorage.setItem("cookie",cookiee);
                                document.getElementById("login-box").style.transform="scale(0)";
                                info("登录成功√",1000);
                                init();
                                // 停止setInterval
                                clearInterval(checkIntervalId);
                            }
                        } 
                    }
                },3000,120000);
            } 
        }
    }
}

function logout(){
    if(cookie==null){
        info("未登录",1000);
        return;
    }
    else{
        localStorage.removeItem("cookie");
        cookie=null;
        info("已登出",1000);
        init();
    }
}

function search(){
    var keyword=document.getElementById("search").value;
    if(keyword==""){
        info("请输入搜索内容",1000);
        return;
    }
    else{
        postsearch(keyword);
    }
}

function getuser(){
    var res
    xml = new XMLHttpRequest();
    xml.open("GET", api+"/user/account?cookie=" + encodeURIComponent(cookie), true);
    xml.send();
    xml.onreadystatechange = function() {
        if (xml.readyState == 4 && xml.status == 200) {
            res = JSON.parse(xml.responseText);
            userdata.avatarUrl=res.profile.avatarUrl;
            userdata.nickname=res.profile.nickname;
            userdata.uid=res.profile.userId;
        } 
    }
    setTimeout(function(){
        getuserplaylist();
    },1500); //wait for getuser to finish befor
}
function initializesearchcovers() {
    var i = 0;
    function processNext() {
        if (i < alternativemusiclist.length) {
            xmll = new XMLHttpRequest();
            xmll.open("GET", api + "/song/detail?ids=" + alternativemusiclist[i], true);
            xmll.send();
            xmll.onreadystatechange = function () {
                if (xmll.readyState == 4 && xmll.status == 200) {
                    ress = JSON.parse(xmll.responseText);
                    cover = ress.songs[0].al.picUrl;
                    document.getElementById(alternativemusiclist[i-1]).setAttribute("src",cover);
                }
            };
            i++;
            setTimeout(processNext, 500); // 设置1秒的间隔
        }
    }
    processNext(); // 启动循环
}
function postsearch(keyword){
    alternativemusiclist = [];
    document.getElementById("list-info").innerHTML=keyword + "|搜索结果";
    document.getElementById("list-name").innerHTML="搜索结果";
    document.getElementById("list-img").src="imgs/celia.jpg";
    switchsection(1);
    //reset list
    var list = document.getElementById("list-body");
    while (list.firstChild) {
        list.removeChild(list.firstChild);
    }
    var res;
    xml = new XMLHttpRequest();
    xml.open("POST", api+"/search?keywords=" + keyword + "&limit=60", true);
    xml.send();
    xml.onreadystatechange = function() {
        if (xml.readyState == 4 && xml.status == 200) {
            res = JSON.parse(xml.responseText);
            for(var i=0;i<res.result.songs.length;i++){
                alternativemusiclist.push(res.result.songs[i].id);
                var tmpfuc = "postlistmusic("+res.result.songs[i].id+")";
                var artists=[];
                for(var j=0;j<res.result.songs[i].artists.length;j++){
                    artists.push(res.result.songs[i].artists[j].name);
                }
                var artist=artists.join(", ");
                var cover="imgs/logo.png";
                var name = res.result.songs[i].name;
                addlistelementsmooth(cover,name,artist,tmpfuc,res.result.songs[i].id); 
            }
        } 
    }
    setTimeout(initializesearchcovers, 1000); //wait for postsearch to finish befor(need to wait for xml.onreadystatechange to ru)
}
function getrecommendlist(){
    var res;
    xml = new XMLHttpRequest();
    xml.open("POST", api+"/recommend/resource" + "?cookie=" + encodeURIComponent(cookie) + "&limit=10", true);
    xml.send();
    xml.onreadystatechange = function() {
        if (xml.readyState == 4 && xml.status == 200) {
            res = JSON.parse(xml.responseText);
            for(var i=0;i<res.recommend.length;i++){
                addcontentelementsmooth(res.recommend[i].picUrl,res.recommend[i].name,"postplaylist("+res.recommend[i].id+")"); 
            }
        } 
    }
}

function postplaylist(playlistid){
    alternativemusiclist = [];
    switchsection(1);
    //reset list
    var list = document.getElementById("list-body");
    while (list.firstChild) {
        list.removeChild(list.firstChild);
    }
    var res;
    xm = new XMLHttpRequest();
    xm.open("POST", api+"/playlist/detail?id=" + playlistid, true);
    xm.send();
    xm.onreadystatechange = function() {
        if (xm.readyState == 4 && xm.status == 200) {
            res = JSON.parse(xm.responseText);
            document.getElementById("list-info").innerHTML=res.playlist.description;
            document.getElementById("list-name").innerHTML=res.playlist.name;
            document.getElementById("list-img").src=res.playlist.coverImgUrl;
            
        } 
    }
    xml = new XMLHttpRequest();
    xml.open("POST", api+"/playlist/track/all?id=" + playlistid, true);
    xml.send();
    xml.onreadystatechange = function() {
        if (xml.readyState == 4 && xml.status == 200) {
            res = JSON.parse(xml.responseText);
            for(var i=0;i<res.songs.length;i++){
                alternativemusiclist.push(res.songs[i].id);
                var tmpfuc = "postlistmusic("+res.songs[i].id+")";
                var artists=[];
                for(var j=0;j<res.songs[i].ar.length;j++){
                    artists.push(res.songs[i].ar[j].name);
                }
                var artist=artists.join(", ");
                addlistelementsmooth(res.songs[i].al.picUrl,res.songs[i].name,artist,tmpfuc,res.songs[i].id);
            }
        } 
    }
}
function getuserplaylist(){
    var res;
    xml = new XMLHttpRequest();
    xml.open("POST", api+"/user/playlist?uid=" + userdata.uid + "&limit=100", true); 
    xml.send();
    xml.onreadystatechange = function() {
        if (xml.readyState == 4 && xml.status == 200) {
            res = JSON.parse(xml.responseText); 
            for(var i=0;i<res.playlist.length;i++){
                addsidebarelementsmooth(res.playlist[i].coverImgUrl,res.playlist[i].name,"postplaylist("+res.playlist[i].id+")");
            }
        }
    }
}

setInterval(function(){
    checkadd();
    if(music.ended){
        musicnext();
    }
    updateprogress();
    updatevolume();
    lyricload();
},100);
setInterval(function(){
    checkcurrent();
    savenow();
},1000)