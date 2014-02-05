document.write('<script src="js/three.js"></script>')
document.write('<script src="js/STLLoader.js"></script>')
document.write('<script src="http://ajax.googleapis.com/ajax/libs/jquery/1/jquery.min.js"></script>')
document.write('<script src="js/TrackballControls.js"></script>')

/*-------------------関数読み込み---------------------*/
function threeStart(){

    // renderSTL();
    // initThree();
    // initCamera();
    //initScene();
    //initLight();
    //initObject();

    


    
}

/*--------------------webGL処理-----------------------*/
var width, height;
var renderer;
function initThree(){

    width = document.getElementById('canvas-frame').clientWidth;//600;
    height = document.getElementById('canvas-frame').clientWidth;
    renderer = new THREE.WebGLRenderer({ antialias: true});
    renderer.setSize(width, height);
    document.getElementById('canvas-frame').appendChild(renderer.domElement);
    renderer.shadowMapEnabled = true;
}

/*--------------------カメラ処理-----------------------*/
var camera;
var controls;
function initCamera(){

    width = document.getElementById('canvas-frame').clientWidth;//600;
    height = document.getElementById('canvas-frame').clientWidth;//document.getElementById('canvas-framl').clientHeight;//600;
    var fov = 80;
    var aspect = width/height;
    var near = 1;
    var far = 10000;

    // var camera = new THREE.PerspectiveCamera(fov, aspect, near, far);
    // camera.position.z = 150;
    // cameraTarget = new THREE.Vector3( 0, 0, 0);



    
    camera = new THREE.PerspectiveCamera(fov, width / height, near, far);
    camera.position.z = 150;
    cameraTarget = new THREE.Vector3(0, 0, 0);
    // camera.up.x = 0; camera.up.y = 0; camera.up.z = 0;
    // camera.position.set(1394, 1416, 854);
    //controls = new THREE.OrbitControls(camera, renderer.domElement);
    
}



/*--------------------シーン処理-----------------------*/
var scene;
function initScene(){

    scene = new THREE.Scene();
}

/*--------------------ライトの生成-----------------------*/
var light, light2;
function initLight(){

    var directionLight = new THREE.DirectionalLight( 0xffffff, 3);
    directionLight.position.z = 3;
    scene.add( directionLight);
    
    // light = new THREE.DirectionalLight(0xcccccc, 1.6);
    // light.position = new THREE.Vector3(0.577, 0.577, 0.577);
    // light.castShadow = true;
    // scene.add(light);

    light2 = new THREE.AmbientLight(0x333333);
    scene.add(light2);
}

/*--------------------オブジェクト処理-----------------------*/
var turbineModel, sphere, plane, axis;
function initObject(){

    //STLの読み込み
    var loader = new THREE.STLLoader();
    loader.addEventListener( 'load', function( event ){
	
	var geometry　= event.content;
	var scale = 0.1;
	var material = new THREE.MeshLambertMaterial({ color: 0x660000});
		
	turbineModel = new THREE.Mesh( geometry, material);
	turbineModel.position.set( -30, 0, 0);
	turbineModel.rotation.set( Math.PI/2, 0, 0)
	turbineModel.scale.set( scale, scale, scale);
	scene.add(turbineModel);
    });
    loader.load( './model/ascii/turbine.STL');

    //球の生成
    sphere = new THREE.Mesh(
    	new THREE.SphereGeometry(200),
    	new THREE.MeshPhongMaterial({ color: 0xffffff
    				    })
    );
    sphere.castShadow = true;
    sphere.receiveShadow = true;
    scene.add(sphere);
    sphere.position.set(0, 0, 500);

    //基準平面
    plane = new THREE.Mesh(
    	    new THREE.CircleGeometry(1000, 100),
    	    new THREE.MeshLambertMaterial({
    		side: THREE.DoubleSide,
    		color: 0x000000,
    	    })
    );
    plane.receiveShadow = true;
    plane.position.set(0, 0, 1);
    scene.add(plane);

    //軸
    axis = new THREE.AxisHelper(1000);
    scene.add(axis);
    axis.position.set(0, 0, 1);
    
}

function renderSTL(){

    initThree();
    initCamera();
    initScene();
    initObject();
    initLight();
    
    //モデルの回転
    var controls_trackball = new THREE.TrackballControls( camera, renderer.domElement);
    
    //controls_trackball.enabled = false;
    console.dir( controls_trackball);
    
    function rendering(){
	//回転

	controls_trackball.update();

	
	renderer.render( scene, camera);
	setTimeout(rendering, 30);
	}
    rendering();
    
}

