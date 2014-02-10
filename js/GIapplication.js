//ワールド変数
var STLModel, STLData, iSFace, PointData;	// iS(intersection)

//ファイルの選択された時
function dochange(event){
    
    var file = event.target.files[0];
    if(file){

	//ファイルの読み込み
	var reader = new FileReader();
	reader.addEventListener('load', onLoaded);
	reader.addEventListener('error', onError);
	
	reader.readAsText(file, "utf-8");	
    }    
}

//ファイル読み込み完了時
function onLoaded(event){

    
    var str = event.target.result;

    renderSTLModel(str);
    STLData = new String;
    STLData = str;
    
}

//ファイルの読み込み失敗
function onError(event){
    if(event.target.error.code == event.target.error.NOT_READABLE_ERR){
	alert("ファイルの読み込みに失敗しました");
    }else{
	alert("エラーが発生しました。" + event.target.error.code);
    }
}
