//ワールド変数 iS(intersection)
var giMeshSTL, giSTLMeshOrigin, iSFace, giGeometrySTL;

//断面計算ボタン
function clickBtnComputeIS(){

    if(!giMeshSTL){
	alert("STLモデルを選んで下さい");
	return;
    }

    scene.remove(iSFace);
    
    var plane_ = new culcCutPlane();
    var geometry_ = computeIntersection( plane_);
    
    renderGeometry( geometry_);
    // renderLine( geometry_ );
    
}

//ファイルの選択された時
function dochange(event){
    
    var file = event.target.files[0];
    if(file){

	//ファイルの読み込み
	var reader = new FileReader();
	reader.addEventListener('load', onLoaded);
	reader.addEventListener('error', onError);
	
	reader.readAsBinaryString(file);
    }    
}

//ファイル読み込み完了時
function onLoaded(event){

    
    var tmpData = event.target.result;
    var loader = new THREE.STLLoader();
    
    THREE.HalfedgeIdCount = 0;//初期化
    initGeometries();
    renderSTLModel( loader.parse(tmpData));
    document.querySelector("#msg").innerHTML = "";
    
    setNextAndPrevHalfedge(giMeshSTL.geometry);
    setPairHalfedges(giMeshSTL.geometry);
    updateSTLSize();

    // computeLayers();
    // computeIntersection();
    // downloadAsHPGLFormat();
}

//ファイルの読み込み失敗
function onError(event){
    if(event.target.error.code == event.target.error.NOT_READABLE_ERR){
	alert("ファイルの読み込みに失敗しました");
    }else{
	alert("エラーが発生しました。" + event.target.error.code);
    }
}

function insertText( geometry_){

    var strPoint = new String;
    for(var i=0;i<geometry_.vertices.length;i++){
	// console.log(G.vertices[i]);
	strPoint += geometry_.vertices[i].x;
	strPoint += ",";
	strPoint += geometry_.vertices[i].y;
	strPoint += ",";
	strPoint += geometry_.vertices[i].z;
	strPoint += "\n";	
    }
    document.querySelector("#msg").innerHTML = strPoint;

}
