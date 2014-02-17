//ワールド変数
var giSTLMesh, giSTLMeshOrigin, iSFace, PointData, giGeometrySTL;	// iS(intersection)
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
    giGeometrySTL = loader.parse(tmpData);
    giGeometrySTL.computeCentroids;
    giGeometrySTL.computeBoundingBox;
    
    giGeometrySTL = setNextAndPrevHalfedge(giGeometrySTL);

    giGeometrySTL = setPairHalfedges(giGeometrySTL);

    // for(var i=0;i<giGeometrySTL.halfedges.length;i++){

    // 	console.log(giGeometrySTL.halfedges[i].pair_id);
    // }
    renderSTLModel();

    updateSTLSize();
    
}

//ファイルの読み込み失敗
function onError(event){
    if(event.target.error.code == event.target.error.NOT_READABLE_ERR){
	alert("ファイルの読み込みに失敗しました");
    }else{
	alert("エラーが発生しました。" + event.target.error.code);
    }
}
