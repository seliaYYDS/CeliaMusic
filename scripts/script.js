var api="https://zm.armoe.cn"
var checkIntervalId;
let lastColorRegions = [];
var cookie;
var userdata = {"avatarUrl":"","nickname":"","uid":""};
var musiclist=[];
var alternativemusiclist=[];
var addstart=null;
var addend=null;
var currentmusic=0;
var music = new Audio();
var uistate = false;
let animationFrameId = null;
var extra = "";
var sorting = "sort";
var loadstate = false;
var stopstate = false;
var lyricdict = {};
var lyricoriginal = [];
var lyrictrans = {};
var currentlyric = -1;
music.pause();
mouseX = 0;
mouseY = 0;
music.volume = 0.4;

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
    initvolume();
    //clear click event of imgs
    var imgs = document.getElementsByTagName("img");
    for (var i = 0; i < imgs.length; i++) {
        imgs[i].addEventListener("click", function(event) {
            event.preventDefault();
        });
    }
    preventdefaultc();
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
    if(event.key === "Escape"){
        closeconfirm();
    }
    if(event.key === "ArrowLeft"){
        if(music.currentTime>5){
            music.currentTime-=5;
        }else{
            music.currentTime=0;
        }
    }
    if(event.key === "ArrowRight"){
        if(music.currentTime<music.duration-5){
            music.currentTime+=5; 
        }
        else{
            music.currentTime=music.duration; 
        }
    }
    if(event.key === "ArrowUp"){
        musicprev();
    }
    if(event.key === "ArrowDown"){
        musicnext();
    }
    if(event.key === " "){
        musicplay();
    }
})
function preventdefaultc() {
    clickables = document.getElementsByClassName("clickable");
    for (var i = 0; i < clickables.length; i++) {
        clickables[i].addEventListener("click", function(event) {
            event.preventDefault();
        });
    }
}

function playui(){
    fb = document.getElementById("footbar")
    pl = document.getElementById("pull-up")
    ui = document.getElementById("play-ui")
    pullimg = document.getElementById("pull-up-img")
    pullimg2 = document.getElementById("pull-up-img2")
    sinfo = document.getElementById("song-info")
    cover = document.getElementById("song-cover")
    sname = document.getElementById("song-name")
    artist = document.getElementById("song-artist")
    duration = document.getElementById("duration")
    songctrl = document.getElementById("song-control")
    if(uistate==false){
        initfluid();
        uistate=true;
        ui.style.top = "0"; 
        pl.style.backgroundColor = "rgba(0,0,0,0.5)";
        pullimg.style.transform="rotateZ(180deg)";
        pullimg2.style.transform="rotateZ(180deg)";
        pullimg2.style.opacity="1";
        cover.style.transform="scale(7)";
        cover.style.top = "-50vh";
        cover.style.left = "calc(5vw + 300px)";
        cover.style.borderRadius="5px";
        sinfo.style.opacity="0";   
    }
    else{
        uistate=false;
        ui.style.top = "100%";
        pullimg.style.transform="";
        pullimg.style.transform="";
        pullimg2.style.opacity="0";
        pl.style.backgroundColor = "rgba(0,0,0,0)";
        cover.style.transform="";
        cover.style.top = "calc(100% - 90px + 12.5px";
        cover.style.left = "2.5px";
        cover.style.borderRadius="10px";
        sinfo.style.opacity="1";
        setTimeout(function(){
            clearcanvas();
        },600);
    }
}
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
//detect window size change
window.addEventListener("resize", function() {
    var musicname=document.getElementById("song-name");
    if(musicname.offsetWidth<400&&musicname.textContent.length>10){
        musicname.style.animation="marquee 10s linear infinite"
    }
    else{
        musicname.style.animation="none";
    }
});

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

function addlyrics(){
    var lyricbox=document.getElementById("ui-lyricbox");
    console.log("STARTSA")
    for(i=0;i<lyricoriginal.length;i++){
        console.log(lyricoriginal[i]);
        var lyricc = document.createElement("div");
        lyricc.classList.add("lyric-element");
        lyricc.setAttribute("id","l" + i);
        lyricc.innerHTML = lyricoriginal[i];
        lyricbox.appendChild(lyricc);
    }
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
    currentlyric = -1;
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
            for(var i=0;i<lyricarr.length-1;i++){
                var time=lyricarr[i].split("]")[0].substring(1);
                var text=lyricarr[i].split("]")[1];
                //translate time to seconds
                var timearr=time.split(":");
                var time=parseInt(timearr[0])*60+parseFloat(timearr[1]);
                //persize to 0.1
                time=Math.round(time*10)/10;
                //add to dict
                lyricdict[time]=text;
                lyricoriginal[i]=text;
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
    if(lyricdict==null||music.paused){
        return;
    }
    //persize currenttime to 0.1
    mtime=Math.round(music.currentTime*10)/10;
    if(lyricdict[mtime]!=undefined){
        currentlyric++;
        console.log(lyricoriginal[currentlyric]);
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
    if(uistate == true){
        setTimeout(function(){
            initfluid();
        },600);
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
    if(uistate == true){
        setTimeout(function(){
            initfluid();
        },600);
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
function initvolume(){
    document.getElementById("volume-slider").addEventListener("input", function() {
        if(document.getElementById("volume-slider").value==0){
            document.getElementById("volume-button").src="imgs/mute_light.png";
        }
        else if(document.getElementById("volume-slider").value<=50){
            document.getElementById("volume-button").src="imgs/volume_small_light.png";
        }
        else if(document.getElementById("volume-slider").value>=50){
            document.getElementById("volume-button").src="imgs/volume_big_light.png"; 
        }
        music.volume = this.value / 100;
    }); 
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
    music.currentTime=0;
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
    music.currentTime=0;
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

function getImageColors(imageUrl, callback, colorCount = 5, sampleSize = 0.1) {
    const img = new Image();
    img.crossOrigin = "Anonymous";
    
    // 设置超时处理
    const timeout = setTimeout(() => {
        console.error('图片加载超时');
        callback([]);
        img.onload = img.onerror = null;
    }, 1000); // 5秒超时

    img.onload = function() {
        clearTimeout(timeout);
        try {
            const canvas = document.createElement('canvas');
            const ctx = canvas.getContext('2d');
            
            // 设置取样区域大小
            const sampleWidth = Math.floor(img.width * sampleSize);
            const sampleHeight = Math.floor(img.height * sampleSize);
            canvas.width = sampleWidth;
            canvas.height = sampleHeight;
            
            // 绘制取样区域
            ctx.drawImage(img, 0, 0, sampleWidth, sampleHeight);
            
            // 获取像素数据
            const pixelData = ctx.getImageData(0, 0, sampleWidth, sampleHeight).data;
            const colors = [];
            
            // 采样颜色
            const step = Math.floor(pixelData.length / (colorCount * 4));
            for (let i = 0; i < pixelData.length && colors.length < colorCount; i += step * 4) {
                const r = pixelData[i];
                const g = pixelData[i + 1];
                const b = pixelData[i + 2];
                const hex = '#' + [r, g, b].map(x => {
                    const hex = x.toString(16);
                    return hex.length === 1 ? '0' + hex : hex;
                }).join('');
                
                // 避免重复颜色
                if (!colors.includes(hex)) {
                    colors.push(hex);
                }
            }
            
            callback(colors);
        } catch (error) {
            console.error('图片处理错误:', error);
            callback([]);
        }
    };
    
    img.onerror = function() {
        clearTimeout(timeout);
        console.error('图片加载失败');
        callback([]);
    };
    
    img.src = imageUrl;
}
function drawColorMatrix(colors, blockSize, randomness, speed, smoothness = 0.5) {
    // 检查颜色数组有效性
    if (!Array.isArray(colors) || colors.length === 0) {
        console.error("Invalid colors array.");
        return;
    }
    
    const canvas = document.getElementById("ui-fluid");
    if (!canvas) return;
    
    const ctx = canvas.getContext("2d");
    const width = canvas.width;
    const height = canvas.height;
    
    // 清除画布
    ctx.clearRect(0, 0, width, height);
    
    // 计算行列数
    const cols = Math.ceil(width / blockSize) + 1;
    const rows = Math.ceil(height / blockSize) + 1;
    
    // 添加区域化控制
    const regionSize = 8; // 增大区域尺寸
    const seedCount = Math.max(3, Math.floor(cols * rows / (regionSize * regionSize)));
    let colorRegions = [];
    
    // 初始化颜色区域
    if (lastColorRegions.length === 0) {
        // 第一次调用时初始化
        for (let i = 0; i < seedCount; i++) {
            const x = Math.floor(Math.random() * cols);
            const y = Math.floor(Math.random() * rows);
            const baseColorIndex = Math.floor(Math.random() * colors.length);
            colorRegions.push({
                x: x,
                y: y,
                colorIndex: baseColorIndex,
                targetColorIndex: (baseColorIndex + 1) % colors.length,
                transitionProgress: 0,
                influenceRadius: 10 + Math.random() * 20
            });
        }
    } else {
        // 后续调用时复用上一次的区域，只更新颜色
        colorRegions = lastColorRegions.map(region => ({
            ...region,
            colorIndex: region.targetColorIndex, // 使用上一次的目标颜色作为新起点
            targetColorIndex: Math.floor(Math.random() * colors.length),
            transitionProgress: 0
        }));
    }
    let colorStates = Array(rows).fill().map(() => 
        Array(cols).fill().map(() => ({
            baseIndex: Math.floor(Math.random() * colors.length),
            targetIndex: Math.floor(Math.random() * colors.length),
            transitionProgress: 0,
            offsetX: Math.random() * 100,
            offsetY: Math.random() * 100
        }))
    );

    function getColor(x, y, frameCount) {
        let finalColor = colors[0];
        let totalWeight = 0;
        
        // 计算所有区域对该点的影响
        colorRegions.forEach(region => {
            const dx = x - region.x;
            const dy = y - region.y;
            const distance = Math.sqrt(dx * dx + dy * dy);
            
            if (distance <= region.influenceRadius) {
                const weight = 1 - (distance / region.influenceRadius);
                totalWeight += weight;
                
                // 计算区域颜色
                const timeFactor = frameCount * 0.005;
                const mixRatio = smoothness * (0.5 + 0.5 * Math.sin(timeFactor));
                const regionColor = mixColors(
                    colors[region.colorIndex], 
                    colors[region.targetColorIndex], 
                    mixRatio * region.transitionProgress
                );
                
                // 混合颜色
                if (totalWeight === weight) {
                    finalColor = regionColor;
                } else {
                    finalColor = mixColors(finalColor, regionColor, weight / totalWeight);
                }
            }
        });
        return finalColor;
    }
    
    // 颜色混合函数保持不变
    function mixColors(color1, color2, ratio) {
        if (typeof color1 === 'string' && color1.startsWith('#')) {
            return mixHexColors(color1, color2, ratio);
        } else {
            return mixRgbColors(color1, color2, ratio);
        }
    }
    
    // 16进制颜色混合保持不变
    function mixHexColors(color1, color2, ratio) {
        const r1 = parseInt(color1.substring(1, 3), 16);
        const g1 = parseInt(color1.substring(3, 5), 16);
        const b1 = parseInt(color1.substring(5, 7), 16);
        
        const r2 = parseInt(color2.substring(1, 3), 16);
        const g2 = parseInt(color2.substring(3, 5), 16);
        const b2 = parseInt(color2.substring(5, 7), 16);
        
        const r = Math.round(r1 * (1 - ratio) + r2 * ratio);
        const g = Math.round(g1 * (1 - ratio) + g2 * ratio);
        const b = Math.round(b1 * (1 - ratio) + b2 * ratio);
        
        return `rgb(${r}, ${g}, ${b})`;
    }
    
    // RGB颜色混合保持不变
    function mixRgbColors(color1, color2, ratio) {
        if (typeof color1 === 'string') {
            color1 = color1.match(/\d+/g).map(Number);
        }
        if (typeof color2 === 'string') {
            color2 = color2.match(/\d+/g).map(Number);
        }
        
        const r = Math.round(color1[0] * (1 - ratio) + color2[0] * ratio);
        const g = Math.round(color1[1] * (1 - ratio) + color2[1] * ratio);
        const b = Math.round(color1[2] * (1 - ratio) + color2[2] * ratio);
        
        return `rgb(${r}, ${g}, ${b})`;
    }
    
    let lastTime = 0;
    const frameDelay = Math.max(1, 1000 / (speed * 60));
    let frameCount = 0;
    
    function animate(currentTime) {
        if (!canvas.parentNode) {
            cancelAnimationFrame(animationFrameId);
            return;
        }
        
        if (currentTime - lastTime < frameDelay) {
            animationFrameId = requestAnimationFrame(animate);
            return;
        }
        
        lastTime = currentTime;
        frameCount++;
        
        // 完全清除画布
        ctx.clearRect(0, 0, width, height);
        
        // 更新颜色区域
        function animate(currentTime) {
            if (!canvas.parentNode) return;
            
            if (currentTime - lastTime < frameDelay) {
                requestAnimationFrame(animate);
                return;
            }
            
            lastTime = currentTime;
            frameCount++;
            
            ctx.clearRect(0, 0, width, height);
            
            // 更新颜色区域
            for (let i = 0; i < colorRegions.length; i++) {
                const region = colorRegions[i];
                
                // 随机决定是否改变目标颜色
                if (Math.random() < 0.005) {
                    region.targetColorIndex = Math.floor(Math.random() * colors.length);
                    region.transitionProgress = 0;
                }
                
                // 更新过渡进度
                if (region.transitionProgress < 1) {
                    region.transitionProgress += 0.01;
                } else {
                    region.colorIndex = region.targetColorIndex;
                    region.transitionProgress = 0;
                }
            }
    
            // 绘制所有方块 - 使用静态模式的平滑方式
            for (let y = 0; y < rows; y++) {
                for (let x = 0; x < cols; x++) {
                    // 使用randomness参数控制偏移量
                    const offsetX = Math.sin(currentTime * 0.001 + x * 0.1) * randomness;
                    const offsetY = Math.cos(currentTime * 0.001 + y * 0.1) * randomness;
                    
                    const color = getColor(x, y, frameCount);
                    ctx.fillStyle = color;
                    ctx.fillRect(
                        x * blockSize + offsetX,
                        y * blockSize + offsetY,
                        blockSize,
                        blockSize
                    );
                }
            }
            animationFrameId = requestAnimationFrame(animate);
        }
    }
    
    if (speed > 0) {
        clearcanvas(); // 清除画布
        animate(0);
    } else {
        // 静态绘制模式
        for (let y = 0; y < rows; y++) {
            for (let x = 0; x < cols; x++) {
                const color = getColor(x, y, 0);
                ctx.fillStyle = color;
                ctx.fillRect(x * blockSize, y * blockSize, blockSize, blockSize);
            }
        }
    }
    lastColorRegions = colorRegions;
}

function clearcanvas(){
    const canvas = document.getElementById("ui-fluid");
    if (!canvas) return;
    const ctx = canvas.getContext("2d"); 
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    lastColorRegions = [];
    // 停止所有动画帧请求
    cancelAnimationFrame(animationFrameId);
}
function initfluid(){
    clearcanvas();
    var cover = document.getElementById("song-img").src;
    getImageColors(cover, function(colors) {
        if (colors.length > 0) {
            drawColorMatrix(colors, 3, 0.1,0, 0.6); // 调整参数以适应你的需求 
        } 
    },20,0.02); // 调整颜色数量和取样区域大小
}


setInterval(function(){
    checkadd();
    if(music.ended){
        musicnext();
    }
    updateprogress();
    lyricload();
},100);
setInterval(function(){
    document.getElementById("ui-songname").innerHTML=document.getElementById("song-name").textContent;
    document.getElementById("ui-artist").innerHTML=document.getElementById("song-artist").textContent;
    checkcurrent();
    savenow();
},1000)
