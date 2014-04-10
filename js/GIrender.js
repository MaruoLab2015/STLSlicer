// document.write('<script src="js/three.min.js"></script>')         //3D描画ライブラリ
document.write('<script src="js/three.js"></script>')         //3D描画ライブラリ
document.write('<script src="js/STLLoader.js" version="1.7"></script>')     //STL読み込みライブラリ
document.write('<script src="js/OrbitControls.js"></script>') // マウスでグリグリ回転プラグイン

//world変数
var giISGeometries = [];//断面データたち
/*--------------------webGL処理-----------------------*/
var width, height;
var renderer;
/*--------------------カメラ処理-----------------------*/
var camera, vecLookAt;
var controls;
/*--------------------シーン処理-----------------------*/
var scene;
/*--------------------ライトの生成-----------------------*/
var light, ambient;
/*--------------------オブジェクト処理-----------------------*/
var cupe, plane, axis;
var tileLines = [];
var tileLength = 25;
var scale_;
if(!scale_) scale_ = 1;

/*-------------------関数読み込み---------------------*/
function threeStart(){


    //3Dデータ描画画面サイズの取得
    width = document.getElementById('canvas-frame').clientWidth;
    height = document.getElementById('canvas-frame').clientHeight;
    
    initScene();    
    initObject();   
    initLight();    
    initCamera();   
    rendering();
}

/*--------------------WebGL処理-----------------------*/
function rendering(){

    renderer = new THREE.WebGLRenderer();
    renderer.setSize(width, height);
    renderer.setClearColor(0x000000, 1);
    document.getElementById('canvas-frame').appendChild(renderer.domElement);

    //control
    controls = new THREE.OrbitControls(camera, renderer.domElement);

    function render(){

	camera.lookAt(vecLookAt);
	requestAnimationFrame(render);
	renderer.render(scene, camera);
	controls.update();
	
    }
    render();    
}
/*--------------------カメラ処理-----------------------*/
function initCamera(){

    camera = new THREE.PerspectiveCamera(45, width/height, 1, 1000000);    
    camera.position.set(160, 160, 200);
    vecLookAt = new THREE.Vector3();
    
}

function adjustCamera( box ){

    vecLookAt = box.center();//対象物の中心を見る
    var camPosition = box.max.length() * 2;
    camera.position.set(camPosition, camPosition, camPosition);
    
}


// /*--------------------シーン処理-----------------------*/
function initScene(){

    scene = new THREE.Scene();
}

// /*--------------------ライトの生成-----------------------*/
function initLight(){

    //照明光
    light = new THREE.DirectionalLight(0xffffff, 1);
    light.position.set(0, 100, 30);
    scene.add(light);

    //環境光
    ambient = new THREE.AmbientLight(0x555555);
    scene.add(ambient)
}

// /*--------------------オブジェクト処理-----------------------*/
var meshes = [];
function initObject(){

    if(axis){
	removeInitObject();
    }
    
    //軸の描画
    axis = new THREE.AxisHelper(100);
    axis.position.set(0,0,0);
    scene.add(axis);

    
    //タイルの床
    setTile(100);

    //切断平面の描画 
    var pGeometry = new THREE.PlaneGeometry(300, 300);
    var pMaterial = new THREE.MeshLambertMaterial({ color: 0x0096d6,
    						    side:THREE.DoubleSide,
    						    wireframe: false,
    						    opacity: 0.5,
    						    transparent: true
    						  });
    plane = new THREE.Mesh(pGeometry, pMaterial);
    plane.position.set(100, 200, 300); //ratate, scale
    plane.rotation.x = 90 * Math.PI / 180;
    scene.add(plane);		


    // checkBoxCutPlane();
    checkVisible("CutPlane");
    renderIntersection();
}

function setTile( length ){

    
    //タイルの床
    var material = new THREE.LineBasicMaterial( { linewidth: 1, color: 0xcccccc } );
    tileLength = length / 5;
    var NumOftiles = Math.floor(length / tileLength);

    for(var i=1;i<=NumOftiles;i++){
	var g = new THREE.Geometry();
	var v1 = new THREE.Vector3();
	var v2 = new THREE.Vector3();	
	v1.x = i*tileLength;
	v2.x = i*tileLength;
	v2.z = length;
	g.vertices.push(v1);
	g.vertices.push(v2);
	meshes.push(g);
    }
    for(var i=1;i<=NumOftiles;i++){

	var g = new THREE.Geometry();
	var v1 = new THREE.Vector3();
	var v2 = new THREE.Vector3();		
	v1.z = i*tileLength;
	v2.z = i*tileLength;
	v2.x = length;
	g.vertices.push(v1);
	g.vertices.push(v2);
	meshes.push(g);
    }

    for (var i=0;i<meshes.length;i++){
	var aLine = new THREE.Line( meshes[i], material);
	scene.add( aLine );
	tileLines.push( aLine );
    }

}

function removeInitObject(){

    scene.remove(plane);
    scene.remove(axis);

    //タイルの削除
    for(var i=0;i<tileLines.length;i++){
	
	scene.remove(tileLines[i]);
    }
    meshes = [];
};

function updateInitObject(){

    removeInitObject();

    var box = giMeshSTL.geometry.boundingBox.clone();
    var bsize = box.max;

    //軸の再描画
    axis = new THREE.AxisHelper(bsize.length() * 2);
    axis.position.set(0,0,0);
    scene.add(axis);

    //タイルの描画
    setTile(bsize.length());

    //カメラの設定(位置・視野)
    adjustCamera( box );
}

function checkVisible( mesh ){

    var check;
    switch(mesh){
	
    case "Axis":
	check = $("#chkAxis").get(0);
	toggleVisibleGeometry( axis, check );break;
	
    case "STLMesh":
	if(!giMeshSTL) return;
	check = $("#chkSTLModel").get(0);
	toggleVisibleGeometry( giMeshSTL, check); break;
	
    case "CutPlane":
	check = $("#chkCutPlane").get(0);
	toggleVisibleGeometry( plane, check); break;	
    }
}

function toggleVisibleGeometry( geometry_, check){

    if(check.checked) geometry_.visible = true;
    else geometry_.visible = false;
}

//切断面の描画
function renderIntersection( point ){
    
    var geom = new THREE.Geometry();

    var v1 = new THREE.Vector3(0, 0, 10);
    var v2 = new THREE.Vector3(10, 0, 0);
    var v3 = new THREE.Vector3(0, 10, 0);
    var v4 = new THREE.Vector3(10, 10, 0);

    geom.vertices.push(v1);
    geom.vertices.push(v2);
    geom.vertices.push(v3);
    geom.vertices.push(v4);

    var face1 = new THREE.Face3(0, 1, 3);

    var faceNormal = new THREE.Vector3(1,1,0);

    face1.normal = faceNormal;

    geom.faces.push( face1 );

    var material = new THREE.MeshLambertMaterial({ color : 0xff0000,
						   wireframe: false
						 });

    var face = new THREE.Mesh( geom, material);
    
}

function renderLine( geometry_){

    var material = new THREE.LineBasicMaterial( { linewidth: 3, color: 0xcccc00 } );

    
    var n = geometry_.vertices.length;
    var sp, ep;

    var isMeshes = [];

    for(var i=0;i<geometry_.endPoint.length ;i++){
	var aGeometry = new THREE.Geometry();
	var aLine = [];
	
	if(!geometry_.endPoint[i-1]) sp = 0;
	else sp = geometry_.endPoint[i-1] + 1;	
	ep = geometry_.endPoint[i];

	for(var j=0;j<=ep - sp ;j++){

	    aLine.push(geometry_.vertices[sp + j]);
	}
	
	aGeometry.vertices = aLine;
	isMeshes.push(new THREE.Line( aGeometry, material));
    }

    for(var i=0;i<isMeshes.length;i++){
	scene.add( isMeshes[i]);
	giISGeometries.push( isMeshes[i]);
    }
}

//切断平面の描画
function renderCutPlane( x0, y0, z0, nx, ny, nz){


    //初期位置に回転・移動
    plane.position.set(0,0,0);
    plane.rotation.set(Math.PI/2, 0, 0);

    var theta1 = Math.atan2(nx, ny);
    var theta2 = Math.atan2(nz, ny);
    plane.rotation.y -= theta1;
    plane.rotation.x += theta2;
    plane.position.set(x0, y0, z0);

}

const STLMESH  = 0;
const ISMESHES = 1;
const ISMESH   = 2;
//各マテリアルの設定
function setMaterial( mesh ){

    var material;
    switch( mesh ){
    case STLMESH:
	material = new THREE.MeshLambertMaterial(
	    { color: 0xff0000,
	      wireframe: true
	    }
	);
	return material;
	break;
    case ISMESHES:
	break;
    case ISMESH:
	var material = new THREE.MeshLambertMaterial({
	    color: 0x000000,
	    side:THREE.DoubleSide
	});
	break;
    }
}

//読み込んだSTLモデルの表示
function renderSTLModel( geometry_ ){

   
    giMeshSTL = new THREE.Mesh( geometry_ , setMaterial(STLMESH));
    scene.add( giMeshSTL);
    moveGeometryToCenter(giMeshSTL.geometry);

}

//断面を一度削除する
function initGeometries(){

    if(giMeshSTL){
	
	scene.remove(giMeshSTL);
	scene.remove(iSFace);
    }
    
    if(giISGeometries){
	
	for(var i=0;i<giISGeometries.length;i++){	
    	    scene.remove( giISGeometries[i]);
	}
    }
}

function renderGeometry( geometry_){

    var material = new THREE.MeshLambertMaterial({
	color: 0x00ff00,
	side:THREE.DoubleSide
    });
    
    setFace3toGeometry(geometry_);

    var Mesh = new THREE.Mesh( geometry_, material);
    // var Mesh = new THREE.Mesh( geometry_, setMaterial(ISMESH));
    scene.add( Mesh);
    giISGeometries.push(Mesh);
}


/*--------------------Geometryの座標変換-----------------------*/

function moveGeometryToCenter( geometry_){

    if(!giMeshSTL) return;

    // geometry_.dynamic = true;
    // geometry_.verticesNeedUpdate = true;
    giMeshSTL.geometry.dynamic = true;
    giMeshSTL.geometry.verticesNeedUpdate = true;

    var boundingBox = giMeshSTL.geometry.boundingBox.clone();

    //移動量の変数の良い名前が思いつかない。。。
    var center = new THREE.Vector3;
    center = boundingBox.center();

    giMeshSTL.geometry.applyMatrix( new THREE.Matrix4().makeTranslation(
    	    -boundingBox.min.x, -boundingBox.min.y, -boundingBox.min.z
    ));
}

function moveCenter(){

    if(!giMeshSTL) return;
    
    var boundingBox = giMeshSTL.geometry.boundingBox.clone();
    var center = boundingBox.center();
    $('#mvx, #mvy, #mvz').val(0);
    $('#sliderMoveX, #sliderMoveY, #sliderMoveZ').slider(
	'option', 'value', 0
    );
    
    moveGeometryToCenter();
}

function translateGeometry(){

    if(!giMeshSTL) return;

    moveGeometryToCenter();
    
    var translationMatrix;
    var x,y,z;
    x=0, y=0, z=0;
    
    giMeshSTL.geometry.dynamic = true;
    giMeshSTL.geometry.verticesNeedUpdate = true;

    x = document.getElementById("mvx").value;
    y = document.getElementById("mvy").value;
    z = document.getElementById("mvz").value;

    $('#sliderMoveX').slider(
	'option', 'value', x
    );

    $('#sliderMoveY').slider(
	'option', 'value', y
    );
    $('#sliderMoveZ').slider(
	'option', 'value', z
    );
    
    translationMatrix= new THREE.Matrix4().makeTranslation(x, y, z);
    giMeshSTL.geometry.applyMatrix(translationMatrix);
}

function rotationGeometry(axis){

    if(!giMeshSTL) return;
    
    var rotationMatrix;
    
    giMeshSTL.geometry.dynamic = true;
    giMeshSTL.geometry.verticesNeedUpdate = true;

    switch(axis){
    case"x": rotationMatrix = new THREE.Matrix4().makeRotationX( -Math.PI / 2);	break;
    case"y": rotationMatrix = new THREE.Matrix4().makeRotationY( -Math.PI / 2);	break;
    case"z": rotationMatrix = new THREE.Matrix4().makeRotationZ( -Math.PI / 2);	break;
    }
    giMeshSTL.geometry.applyMatrix(rotationMatrix);

    translateGeometry();
}


function setGeometryScale(isSlider){

    if(!giMeshSTL) return;

    if(document.getElementById("scale").value <= 0){
    	document.getElementById("scale").value = "1";
    	return;
    } 
    
    //scaleを元に戻す
    giMeshSTL.geometry.dynamic = true;
    giMeshSTL.geometry.verticesNeedUpdate = true;
    giMeshSTL.geometry.applyMatrix( new THREE.Matrix4().makeScale(
    	   1/scale_, 1/scale_, 1/scale_
    ));

    
    scale_ = document.getElementById("scale").value;
    scale_ = parseFloat(scale_);

    giMeshSTL.geometry.dynamic = true;
    giMeshSTL.geometry.verticesNeedUpdate = true;
    giMeshSTL.geometry.applyMatrix( new THREE.Matrix4().makeScale(
    	    scale_, scale_, scale_
    ));
    updateSTLSize();
    updateInitObject();
}

function setFace3toGeometry( geometry_){

    var cutPlane = new culcCutPlane();
    var faceNormal = new THREE.Vector3(cutPlane.nx, cutPlane.ny, cutPlane.nz);
    var n = geometry_.vertices.length;
    var sp, ep;
    
    for(var i=0;i<geometry_.endPoint.length ;i++){
	sp = geometry_.endPoint[i - 1] || 0;
	ep = geometry_.endPoint[i];
	for(var j=0;j< ep - sp -2;j++){
	    var face = new THREE.Face3(sp, sp + j+2, sp +j+1);
    	    face.normal = faceNormal;
    	    geometry_.faces.push(face);
	}
    }
}
