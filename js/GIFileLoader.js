// document.write('<script src="js/GISTLLoader.js"></script>')

function dochange(event){
    console.log("dochange");
    
    var file = event.target.files[0];
    if(file){
	readfile(file);
    }
}

function readfile(file){
    console.log("readfile");

    var reader = new FileReader();
    reader.addEventListener('load', onLoaded);
    reader.addEventListener('error', onError);

    reader.readAsText(file, "utf-8");
}

function onLoaded(event){
    console.log("onLoaded")

    var str = event.target.result;
    document.querySelector("#msg").innerHTML = str;
    console.log("text has read");

    var loader = new GISTLLoader();
    
    
}

function onError(event){
    if(event.target.error.code == event.target.error.NOT_READABLE_ERR){
	alert("ファイルの読み込みに失敗しました");
    }else{
	alert("エラーが発生しました。" + event.target.error.code);
    }
}

function loadFile(){
    console.log("こんにちは");
}
