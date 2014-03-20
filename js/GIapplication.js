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

    // $(function(){
    // 	$("#overlay").fadeIn("fast");
    // });
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
    $("#overlay").fadeIn("fast");
    setTimeout( function(){
	loader.parse(tmpData);
    }, 100);
    
    console.log("parse");

}

function loadSTLVertices( geometry_ ){

    geometry_.mergeVertices();
    
    var callbacks = $.Callbacks();
    callbacks.add( $("#overlay-title").html("STLデータの描画中..."));
    callbacks.add(  renderSTLModel( geometry_ ));
    callbacks.add( $("#overlay-title").html("前後のハーフエッジデータの作成中..."));
    callbacks.add( setNextAndPrevHalfedge( giMeshSTL.geometry ));
    callbacks.add( $("#overlay-title").html("対のハーフエッジデータの作成中..."));
    callbacks.add( setPairHalfedges( giMeshSTL.geometry ));
    callbacks.add( $("#overlay-title").html("STLの情報を取得中..."));
    callbacks.add( updateSTLSize());
    callbacks.add( $("#overlay-title").html("カメラの移動・平面軸の更新中..."));   
    callbacks.add( [adjustCamera(), updateInitObject()]);
    callbacks.add( $("#overlay").fadeOut());
    callbacks.fire();
    
    // renderSTLModel( geometry_ );//読み取ったジオメトリの描画


    // 	// オーバーレイの解除



	
    // 	document.querySelector("#msg").innerHTML = "";

    // 	//HEの復元
    // 	setNextAndPrevHalfedge(giMeshSTL.geometry);
    // 	setPairHalfedges(giMeshSTL.geometry);
    // 	updateSTLSize();

    // 	// giCheck();//デバッグ情報

    // 	//視線方向
    // 	adjustCamera();
    // 	updateInitObject();


    return;
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

function giCheck(){

    giMeshSTL.geometry.mergeVertices();
    var num = giMeshSTL.geometry.halfedges.length;
    for(var i=0;i<num;i++){

	console.log(giMeshSTL.geometry.halfedges[i].vertex);
    }		
}
