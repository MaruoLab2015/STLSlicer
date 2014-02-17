document.write('<script src="js/three.js"></script>')         //3D描画ライブラリ
document.write('<script src="js/STLLoader.js"></script>')     //STL読み込みライブラリ
document.write('<script src="js/OrbitControls.js"></script>') // マウスでグリグリ回転プラグイン

/*--------------------webGL処理-----------------------*/
var width, height;
var renderer;
/*--------------------カメラ処理-----------------------*/
var camera;
var controls;
/*--------------------シーン処理-----------------------*/
var scene;
/*--------------------ライトの生成-----------------------*/
var light, ambient;
/*--------------------オブジェクト処理-----------------------*/
var cupe, plane, axis;

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
	requestAnimationFrame(render);
	renderer.render(scene, camera);
	controls.update();
	
    }
    render();    
}
/*--------------------カメラ処理-----------------------*/
function initCamera(){

    camera = new THREE.PerspectiveCamera(45, width/height, 1, 1000);
    camera.position.set(40, 60, 100);
    camera.lookAt(plane.position);
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
function initObject(){

    //軸の描画
    axis = new THREE.AxisHelper(1000);
    axis.position.set(0,0,0);
    scene.add(axis);

    
    //タイルの床
    var radian = 0;//45 * 3.14 / 180;
    for(var i=-5; i<5; i++){
	for(var j=-5; j<5; j++){
	    var groundColor = ((i+j)&1) == 1 ? 0x999999 : 0x333333;
	    var mesh = new THREE.Mesh(new THREE.PlaneGeometry(25, 25), new THREE.MeshLambertMaterial({color: groundColor,
												      side:THREE.DoubleSide
												     }));
	    mesh.rotation.x = - 90 *Math.PI / 180;

	    var x = i*25;
	    var y = j*25;

	    mesh.position.x = x*Math.cos(radian) - y*Math.sin(radian);
	    mesh.position.z = x*Math.sin(radian) + y*Math.cos(radian);
	    scene.add(mesh);
	}
    }

    //切断平面の描画 
    var pGeometry = new THREE.PlaneGeometry(300, 300);
    var pMaterial = new THREE.MeshLambertMaterial({ color: 0x0096d6,
    						    side:THREE.DoubleSide,
    						    wireframe: false,
    						    opacity: 0.5,
    						    transparent: true
    						  });
    plane = new THREE.Mesh(pGeometry, pMaterial);
    plane.position.set(0, 0, 0); //ratate, scale
    plane.rotation.x = 90 * Math.PI / 180;
    scene.add(plane);		


    checkBoxCutPlane();
    renderIntersection();
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

function checkBoxCutPlane(){

    var check = document.getElementById("chkCutPlane");
    if(check.checked){

	plane.visible = true;
	console.log("check!");
    }else{

	plane.visible = false;
	console.log("uncheck");
    }
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
    // scene.add(face);
    
}

//読み込んだSTLモデルの表示
function renderSTLModel(){

    if(giSTLMesh){
	scene.remove(giSTLMesh);
	scene.remove(iSFace);
	document.querySelector("#msg").innerHTML = "";
	delete PointData;
    }
    
    var stlMaterial = new THREE.MeshLambertMaterial({ color: 0xff0000,
						      wireframe: true
						    });
    

    giSTLMesh = new THREE.Mesh( giGeometrySTL, stlMaterial);

    scene.add( giSTLMesh);

    giGeometrySTL = moveGeometryToCenter(giGeometrySTL);

}

function moveGeometryToCenter(){

    if(!giSTLMesh) return;

    
    giSTLMesh.geometry.dynamic = true;
    giSTLMesh.geometry.verticesNeedUpdate = true;

    var boundingBox = giSTLMesh.geometry.boundingBox.clone();

    //移動量の変数の良い名前が思いつかない。。。
    var center = new THREE.Vector3;
    center = boundingBox.center();

    giSTLMesh.geometry.applyMatrix( new THREE.Matrix4().makeTranslation(
    	    -center.x, -boundingBox.min.y, -center.z
    ));
    // document.getElementById("mvx").value = -center.x;
    // document.getElementById("mvy").value = -boundingBox.min.y;
    // document.getElementById("mvz").value = -center.z;
    // return geometry_;
}

function moveCenter(){

    if(!giSTLMesh) return;
    
    var boundingBox = giSTLMesh.geometry.boundingBox.clone();
    var center = boundingBox.center();
    $('#mvx, #mvy, #mvz').val(0);
    $('#sliderMoveX, #sliderMoveY, #sliderMoveZ').slider(
	'option', 'value', 0
    );
    
    moveGeometryToCenter();
}

function translateGeometry(){

    if(!giSTLMesh) return;

    moveGeometryToCenter();
    
    var translationMatrix;
    var x,y,z;
    x=0, y=0, z=0;
    
    giSTLMesh.geometry.dynamic = true;
    giSTLMesh.geometry.verticesNeedUpdate = true;

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
    giSTLMesh.geometry.applyMatrix(translationMatrix);

}

function rotationGeometry(axis){

    if(!giSTLMesh) return;
    
    var rotationMatrix;
    
    giSTLMesh.geometry.dynamic = true;
    giSTLMesh.geometry.verticesNeedUpdate = true;

    switch(axis){
    case"x": rotationMatrix = new THREE.Matrix4().makeRotationX( -Math.PI / 2);	break;
    case"y": rotationMatrix = new THREE.Matrix4().makeRotationY( -Math.PI / 2);	break;
    case"z": rotationMatrix = new THREE.Matrix4().makeRotationZ( -Math.PI / 2);	break;
    }
    giSTLMesh.geometry.applyMatrix(rotationMatrix);

    translateGeometry();
    // moveGeometryToCenter(giSTLMesh.geometry);
    

}

var scale_;
if(!scale_) scale_ = 1;
function setGeometryScale(isSlider){

    if(!giSTLMesh) return;

    // if(isSlider){

    // 	if(document.getElementById("scale").value <= 0){
    // 	    s_ = document.getElementById("scale").value ;
    // 	    s_ = Math.abs(s_);
    // 	    s_ = 1 / s_;
    // 	    document.getElementById("scale").value = s_;
    // 	} 
    // }else{

    	if(document.getElementById("scale").value <= 0){
    	    document.getElementById("scale").value = "1";
    	    return;
    	} 
    // }
    

    //scaleを元に戻す
    giSTLMesh.geometry.dynamic = true;
    giSTLMesh.geometry.verticesNeedUpdate = true;
    giSTLMesh.geometry.applyMatrix( new THREE.Matrix4().makeScale(
    	   1/scale_, 1/scale_, 1/scale_
    ));

    
    scale_ = document.getElementById("scale").value;
    // if(scale_ <= 0){
    // 	document.getElementById("scale").value = "1";
    // }


    scale_ = parseFloat(scale_);

    


    giSTLMesh.geometry.dynamic = true;
    giSTLMesh.geometry.verticesNeedUpdate = true;
    giSTLMesh.geometry.applyMatrix( new THREE.Matrix4().makeScale(
    	    scale_, scale_, scale_
    ));


    updateSTLSize();
    
}
