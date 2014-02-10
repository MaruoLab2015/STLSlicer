function computeIntersection(){

    if(!STLData){
	alert("STLモデルを選んで下さい");
	return;
    }

    scene.remove(iSFace);

    var geometry, cutPlane;
    var material = new THREE.MeshLambertMaterial({ color: 0x00ff00,
						   side:THREE.DoubleSide,
						 });
    geometry = new THREE.Geometry();//比較用STLジオメトリ
    cutPlane = new culcCutPlane();//切断平面の初期化
    
    iSGeometry = new THREE.Geometry()//断面のジオメトリ
    var loader = new THREE.STLLoader();

    //STLデータのパース(アスキーのみ))
    geometry = stlParseASCII(STLData);


    
    //三角形の数だけ繰り返す
    for(var i=0;i<geometry.faces.length;i++){

	// //progressbar
	// var rate = i/geometry.faces.length * 100;
	// $(function(){
	//     $('#progressbar').progressbar('option', 'value', rate + 1);
	// });
	//あとで3点・２点とも同じ場合について考える
	
	//AB,BC,CAについてチェックを繰り返す
	var ivector = new THREE.Vector3();//平面と線分の交点
	var PA, PB, p;
	p = cutPlane;
	for(var j=0;j<3;j++){
	    switch(j){
	    case 0: PA = geometry.faces[i].a; PB = geometry.faces[i].b; break;
		case 1: PA = geometry.faces[i].b; PB = geometry.faces[i].c; break;
		case 2: PA = geometry.faces[i].a; PB = geometry.faces[i].a; break;
	    }
	    console.log(PA);
	    console.log(PB);
	    console.log(p);
	    if((ivector = intersectPlaneAndline( p, PA, PB))){
		iSGeometry.vertices.push(ivector);
	    }
	}
    }

    iSGeometry.mergeVertices();//重複した点の削除
    //カットした断面の法線ベクトルの代入

    var faceNormal = new THREE.Vector3(cutPlane.nx, cutPlane.ny, cutPlane.nz);
    var n = iSGeometry.vertices.length;
    for(var i=0;i<n - 2 ;i++){
     	var face1 = new THREE.Face3(0, i+1, i+2);
    	face1.normal = faceNormal;
    	iSGeometry.faces.push(face1);
    }


    iSFace = new THREE.Mesh( iSGeometry, material);
    scene.add( iSFace);
    
    console.log(iSGeometry.vertices.length);

    var strPoint = new String;
    for(var i=0;i<iSGeometry.vertices.length;i++){
	// console.log(G.vertices[i]);
	strPoint += iSGeometry.vertices[i].x;
	strPoint += ",";
	strPoint += iSGeometry.vertices[i].y;
	strPoint += ",";
	strPoint += iSGeometry.vertices[i].z;
	strPoint += "\n";	
    }
    document.querySelector("#msg").innerHTML = strPoint;
    PointData = new String;
    PointData = strPoint;
}

//交差判定
//p:切断面, 線分AB:aとｂを結ぶ線分
function intersectPlaneAndline(p, a, b){
    
    //平面上の点P0
    var P0 = new THREE.Vector3(p.x0, p.y0, p.z0);

    //PA,PBベクトル
    var PA = new THREE.Vector3(a.x - P0.x, a.y - P0.y, a.z - P0.z);
    var PB = new THREE.Vector3(b.x - P0.x, b.y - P0.y, b.z - P0.z);

    //PA,PBの平面法線との内積
    var dot_PA = PA.x * p.a + PA.y * p.b + PA.z * p.c;
    var dot_PB = PB.x * p.a + PB.y * p.b + PB.z * p.c;

    //先端が平面上にあるときの誤差の吸収
    if (Math.abs(dot_PA) < 0.000001){ dot_PA = 0.0};
    if (Math.abs(dot_PB) < 0.000001){ dot_PB = 0.0};

    //交差判定
    if( dot_PA == 0.0 && dot_PB == 0.0){
	
	//両端が平面上にあり、交点を計算出来ない
	return false;
    }else if( (dot_PA >= 0.0 && dot_PB <= 0.0) ||
              (dot_PA <= 0.0 && dot_PB >= 0.0)){

	//交差している
	// console.log("intersection!");
    }else{

	//交差していない
	return false;
    }

    //交点を求める
    AB = new THREE.Vector3(b.x - a.x, b.y - a.y, b.z - a.z);

    //交点とAの距離:交点とBの距離 = dot_PA : dot_PB
    var rate = Math.abs(dot_PA)/(Math.abs(dot_PA)+ Math.abs(dot_PB));

    var ivector = new THREE.Vector3();//交差する座標
    ivector.x = a.x + (AB.x * rate);
    ivector.y = a.y + (AB.y * rate);
    ivector.z = a.z + (AB.z * rate);    
    
    return ivector;
}

//入力されたパラメータから平面方程式の計算
function culcCutPlane(){

    var nx = document.getElementById("nx").value;
    var ny = document.getElementById("ny").value;
    var nz = document.getElementById("nz").value;

    var x0 = document.getElementById("x0").value;
    var y0 = document.getElementById("y0").value;
    var z0 = document.getElementById("z0").value;
    
    if(nx=="" || nx==null || ny=="" || ny==null || nz=="" || nz==null ){
	return null;
    }
    var cox = nx;
    var coy = ny;
    var coz = nz;
    var co = - nx*x0 - ny*y0 - nz*z0;
    
    document.getElementById("coefficientX").value = cox;
    document.getElementById("coefficientY").value = coy;
    document.getElementById("coefficientZ").value = coz;
    document.getElementById("coefficient").value = co;

    //プロパティ
    //ax+by+cz+d=0
    this.a = parseInt(cox);
    this.b = parseInt(coy);
    this.c = parseInt(coz);
    this.d = co;
    //通る点
    this.x0 = parseInt(x0);
    this.y0 = parseInt(y0);
    this.z0 = parseInt(z0);
    //法線ベクトル
    this.nx = a;
    this.ny = b;
    this.nz = c;

    renderCutPlane(this.x0, this.y0, this.z0, this.nx, this.ny, this.nz);
    
}

function stlParseASCII(data){
    
    var patternFace, patternNormal, patternVertex, result, text, normal, geometry, length, normal;
    geometry = new THREE.Geometry;
    patternFace = /facet([\s\S]*?)endfacet/g;
    
    while(((result = patternFace.exec(data)) != null)){

	text = result[0];
	
	// 法線ベクトルの取得
	patternNormal = /normal[\s]+([\-+]?[0-9]+\.?[0-9]*([eE][\-+]?[0-9]+)?)+[\s]+([\-+]?[0-9]*\.?[0-9]+([eE][\-+]?[0-9]+)?)+[\s]+([\-+]?[0-9]*\.?[0-9]+([eE][\-+]?[0-9]+)?)+/g;
	while (((result = patternNormal.exec(text)) != null)) {

	    normal = new THREE.Vector3(parseFloat(result[1]), parseFloat(result[3]), parseFloat(result[5]));
	    // console.log('(nx,ny,nz)=(%f, %f, %f)',parseFloat(result[1]) , parseFloat(result[3]), parseFloat(result[5]));
	    
	}

	// 頂点の取得
	patternVertex = /vertex[\s]+([\-+]?[0-9]+\.?[0-9]*([eE][\-+]?[0-9]+)?)+[\s]+([\-+]?[0-9]*\.?[0-9]+([eE][\-+]?[0-9]+)?)+[\s]+([\-+]?[0-9]*\.?[0-9]+([eE][\-+]?[0-9]+)?)+/g;
	while (((result = patternVertex.exec(text)) != null)) {

	    geometry.vertices.push(new THREE.Vector3(parseFloat(result[1]), parseFloat(result[3]), parseFloat(result[5])));

	    // console.log('(x,y,z)=(%f, %f, %f)',parseFloat(result[1]) , parseFloat(result[3]), parseFloat(result[5]));

	}
	// console.log("length = %d", geometry.vertices.length);
	length = geometry.vertices.length;
	geometry.faces.push(new THREE.Face3(
	    geometry.vertices[length - 3],
	    geometry.vertices[length - 2],
	    geometry.vertices[length - 1],
	    normal
	));

    }

    return geometry;
    
}
