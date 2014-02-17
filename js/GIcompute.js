function computeIntersection(){

    if(!giSTLMesh){
	alert("STLモデルを選んで下さい");
	return;
    }

    scene.remove(iSFace);

    var geometry, cutPlane;
    var material = new THREE.MeshLambertMaterial({ color: 0x00ff00,
						   side:THREE.DoubleSide,
						 });
    cutPlane = new culcCutPlane();//切断平面の初期化
    
    iSGeometry = new THREE.Geometry()//断面のジオメトリ
    var loader = new THREE.STLLoader();

    geometry = giSTLMesh.geometry;


    
    //三角形の数だけ繰り返す
    for(var i=0;i<geometry.faces.length;i++){

	//あとで3点・２点とも同じ場合について考える
	
	//AB,BC,CAについてチェックを繰り返す
	var ivector = new THREE.Vector3();//平面と線分の交点
	var PA, PB, p;
	p = cutPlane;
	var a, b, c;
	a = geometry.faces[i].a;
	b = geometry.faces[i].b;
	c = geometry.faces[i].c;
	for(var j=0;j<3;j++){
	    switch(j){
	    case 0: PA = geometry.vertices[a]; PB = geometry.vertices[b]; break;
	    case 1: PA = geometry.vertices[b]; PB = geometry.vertices[c]; break;
	    case 2: PA = geometry.vertices[a]; PB = geometry.vertices[a]; break;
	    }
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

function updateSTLSize(){

    if(!giSTLMesh) return;
    var box = giSTLMesh.geometry.boundingBox.clone();
    $("#sizex").val(Math.round(box.max.x - box.min.x));
    $("#sizey").val(Math.round(box.max.y - box.min.y));
    $("#sizez").val(Math.round(box.max.z - box.min.z));

    $("#numVertex").val(giSTLMesh.geometry.vertices.length);
    $("#numFace").val(giSTLMesh.geometry.faces.length);
}


function setNextAndPrevHalfedge(geometry_){

    if(!geometry_) return;

    //全ての面に対して３つずつhalfedge作成
    for(var i=0;i<geometry_.faces.length;i++){


	var aFace = geometry_.faces[i];

	//ハーフエッジの生成と始点の代入
	for(var j=0;j<3;j++){
	    var halfedge = new THREE.Halfedge();
	    switch(j){
	    case 0:
		halfedge.vertex = geometry_.vertices[aFace.a];
		break;
	    case 1:
		halfedge.vertex = geometry_.vertices[aFace.b];
		break;
	    case 2:
		halfedge.vertex = geometry_.vertices[aFace.c];
		break;
	    }

	    geometry_.halfedges.push(halfedge);
	}

	//next,previousの代入
	var HElength = geometry_.halfedges.length;
	var geoHE = geometry_.halfedges;

	geometry_.halfedges[HElength-3].setNextHE(geoHE[HElength-2].id);	
	geometry_.halfedges[HElength-3].setPrevHE(geoHE[HElength-1].id);
	
	geometry_.halfedges[HElength-2].setNextHE(geoHE[HElength-1].id);
	geometry_.halfedges[HElength-2].setPrevHE(geoHE[HElength-3].id);
	
	geometry_.halfedges[HElength-1].setNextHE(geoHE[HElength-3].id);
	geometry_.halfedges[HElength-1].setPrevHE(geoHE[HElength-2].id);

    }

    return geometry_;
}

function setPairHalfedges( geometry_ ){

    if( !geometry_) return;

    var geoHE = geometry_.halfedges;
    var v1, v2;	//比較する座標
    var num=0;
    for(var i=0;i<geometry_.halfedges.length;i++){	


	if(geoHE[i].times_visit == 1) continue;//一度結びつけたHEはスキップ
	num++;		    	
	v1 = geoHE[i].vertex;

	for(var j=0;j<geoHE.length;j++){

	    if(i==j) continue;//同じ要素はスキップ

	    v2 = geoHE[j].vertex;
	    if(isEqualVector3( v1, v2)){

		var HE1, HE2;
		var v3, v4;
		HE1 = geoHE[geoHE[i].next_id], HE2 = geoHE[geoHE[j].prev_id];
		v3 = HE1.vertex; v4 = HE2.vertex;
		if(isEqualVector3(v3, v4)){
		    geometry_.halfedges[i].pair_id = j;
		    geometry_.halfedges[j].pair_id = i;
		    geoHE[i].times_visit++;
		    geoHE[j].times_visit++;

		}
	    }
	    
	}
    }

    console.log(num);

    return geometry_;
}

function isEqualVector3( v, w){

    // console.log(v);
    // console.log(w);
    if(!(v.x == w.x)) return false;
    if(!(v.y == w.y)) return false;
    if(!(v.z == w.z)) return false;

    return true;
}
