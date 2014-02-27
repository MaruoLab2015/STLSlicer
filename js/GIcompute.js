document.write('<script type="text/javascript" src="js/GIHalfedge.js"></script>')

//端点と一致しないようにオフセットを与える
const CUTOFFSET = 0.01;

function computeLayers(){

    if(!giMeshSTL) return;

    
    var pitch = $("#pitch").val();

    var box = giMeshSTL.geometry.boundingBox.clone();
    var height = box.size().y;
    var plane;
    var isGeometries = [];

    for(var i=0;i<= Math.floor(height/pitch) ;i++){

    	var geometry_;
    	plane = new culcCutPlane( pitch * i + CUTOFFSET);

	//面の最後は一致したらOFFSET分だけ下げた面で考える
	if(i == Math.floor(height/pitch))
	    plane = new culcCutPlane( pitch * i - CUTOFFSET);

	isGeometries.push(computeIntersection( plane ));
    }

    //一度計算していたら画面から削除
    if(giISGeometries){
	for(var i=0;i<giISGeometries.length;i++){
	    
    	    scene.remove( giISGeometries[i]);
	}
    }

    //断面の表示
    for(var i=0;i<isGeometries.length;i++){
	
    	// renderGeometry( isGeometries[i]);
	renderLine( isGeometries[i]);
    }
}

var giNextPoint;
function computeIntersection( plane ){

    if(!plane) plane = new culcCutPlane();
    iSGeometry = new THREE.Geometry()//断面のジオメトリ
    var GHE = giMeshSTL.geometry.halfedges;
    
    //ハーフエッジの数だけ繰り返す
    for(var i=0;i<GHE.length;i++){

	if(!GHE[i].unVisited) continue;//一度調べたらスキップ
	
	//あとで3点・２点とも同じ場合について考える
	
	//AB,BC,CAについてチェックを繰り返す
	var ivector = new THREE.Vector3();//平面と線分の交点
	var PA, PB, p;
	
	p = plane;
	PA = GHE[i].vertex; PB = GHE[GHE[i].next_id].vertex;
	if((ivector = intersectPlaneAndline( p, PA, PB, true))){//１つ目の輪郭線の探索

	    // console.log(ivector);
	    // console.log("i:" + i);
	    var startPoint = ivector;
	    var nextPoint = new THREE.Vector3();

	    //座標の四捨五入
	    var sp = ivector.clone();
	    iSGeometry.vertices.push(roundVector3(sp));

	    checkVisitTriangleVertex(GHE, i, false);
	    
	    var pair = GHE[i].pair_id;
	    var isVertex = false;
	    var isFaceClosed = true;

	    var times = 0;//辿る三角の限界

	    //最初の交点と等しくなるまで三角形を追う
	    while(!isEqualVector3(startPoint, nextPoint)){

		isSearchNeighborHE = true;
		

		if(times++ > GHE.length){
		    // alert("正しい輪郭得られていない可能性があります");
		    console.log("不正確");
		    isFaceClosed = false;
		    break;
		    
		}

		checkVisitTriangleVertex(GHE, pair, false);
		
		if((nextPoint = computeISPlaneAndHENext( GHE[pair], p))){//次のHEと交点の計算

	    	    // console.log("next1");
	    	    // console.log(nextPoint);
		    pair = GHE[pair].next_id;
		}else if((nextPoint = computeISPlaneAndHEPrev( GHE[pair], p))){//前のHEと交点の計算 
		    
	    	    // console.log("prev1");
	    	    // console.log(nextPoint);
		    pair = GHE[pair].prev_id;
		}else{

		    // console.log("else");
		    pair = GHE[pair].pair_id;
		    pair = GHE[pair].next_id;

		    continue;
		}

		if(nextPoint){//誤差をなくすために四捨五入

		    if(isEqualVector3(startPoint, nextPoint)){

		    	iSGeometry.mergeVertices();
			recoverEndVertex(iSGeometry);
		    }
		    
		    
		    var np = new THREE.Vector3(nextPoint.x, nextPoint.y, nextPoint.z);
		    np = roundVector3(np);
		    iSGeometry.vertices.push(np);
		}
		
		
		pair = GHE[pair].pair_id;

		//最初の点と最後の点が重なった時一度だけ開始点の記録
		if(isEqualVector3(startPoint, nextPoint)){

		    if(isFaceClosed){
			var normal = new THREE.Vector3(p.nx, p.ny, p.nz);
			var n = iSGeometry.vertices.length;
			iSGeometry.endPoint.push(n -1);
			var np = new THREE.Vector3(nextPoint.x, nextPoint.y, nextPoint.z);
			np = roundVector3(np);
			// console.log(np);
			iSGeometry.endVertices.push(np);
			
			isFaceClosed = true;
		    }

		}
	    }
	}
    }

    resetHEUnVisit(giMeshSTL.geometry);



    //重複した点を削除すると出力がうまくいかない
    // iSGeometry.mergeVertices();//重複した点の削除
    // console.log("diff:" + diff);

    
    console.log(iSGeometry.vertices.length);
    // for(var i=0;i<iSGeometry.vertices.length;i++){

    // 	console.log(iSGeometry.vertices[i]);
    // }

    //テキストボックスに座標の代入
    insertText(iSGeometry);
    
    return iSGeometry;

}

function recoverEndVertex( geometry_ ){

    for(var i=0;i<geometry_.endPoint.length;i++){

	geometry_.vertices.splice(geometry_.endPoint[i], 0, geometry_.endVertices[i]);
    }
}


function roundVector3( v ){

    // v.x = Math.round(v.x);
    // v.y = Math.round(v.y);
    // v.z = Math.round(v.z);
    
    return v;
}

function checkVisitTriangleVertex( HE, id, isUnVisited){

    HE[id].unVisited = isUnVisited;
    HE[HE[id].next_id].unVisited = isUnVisited;
    HE[HE[id].prev_id].unVisited = isUnVisited;
}

function computeISPlaneAndHENext( HE, plane){

    var PA, PB, ivector;
    var GHE = giMeshSTL.geometry.halfedges;

    //始点が基準点なので次のHEは次の始点と次の次の始点
    PA = GHE[HE.next_id].vertex; PB = GHE[GHE[HE.next_id].next_id].vertex;

    if((ivector = intersectPlaneAndline(plane, PA, PB, false))){

    	return ivector;
    }
    

    return false;
}

function computeISPlaneAndHEPrev( HE, plane){

    var PA, PB, ivector;
    var GHE = giMeshSTL.geometry.halfedges;

    //今の始点と前の始点
    PB = HE.vertex; PA = GHE[HE.prev_id].vertex;

    if((ivector = intersectPlaneAndline(plane, PA, PB, false)))
    	return ivector;

    return false;
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

    PointData = new String;
    PointData = strPoint;
}

//交差判定
//p:切断面, 線分AB:aとｂを結ぶ線分
function intersectPlaneAndline(p, a, b, isIncludeZero){


    
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
    if(isIncludeZero){//０と含む
	// console.log("含む");
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
    }else{//０を含まない
	// console.log("含まない");
	if( dot_PA == 0.0 && dot_PB == 0.0){
	    
	    //両端が平面上にあり、交点を計算出来ない

	    // TODO:両端がある場合反対側を返す。
	    // if(!isEqualVector3(giNextPoint, a)) return a;
	    // if(!isEqualVector3(giNextPoint, b)) return b;
	    return false;
	}else if( (dot_PA > 0.0 && dot_PB < 0.0) ||
		  (dot_PA < 0.0 && dot_PB >= 0.0)){

	    //交差している
	    // console.log("intersection!");
	}else{

	    //交差していない
	    return false;
	}
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
function culcCutPlane( pitch ){

    var nx = document.getElementById("nx").value;
    var ny = document.getElementById("ny").value;
    var nz = document.getElementById("nz").value;

    var x0 = document.getElementById("x0").value;
    var y0 = document.getElementById("y0").value;
    var z0 = document.getElementById("z0").value;

    if(pitch) y0 = pitch;

    
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
    this.a = parseFloat(cox);
    this.b = parseFloat(coy);
    this.c = parseFloat(coz);
    this.d = co;
    //通る点
    this.x0 = parseFloat(x0);
    this.y0 = parseFloat(y0);
    this.z0 = parseFloat(z0);
    //法線ベクトル
    this.nx = a;
    this.ny = b;
    this.nz = c;

    renderCutPlane(this.x0, this.y0, this.z0, this.nx, this.ny, this.nz);
    
}

function updateSTLSize(){

    if(!giMeshSTL) return;
    var box = giMeshSTL.geometry.boundingBox.clone();
    $("#sizex").val(Math.round(box.max.x - box.min.x));
    $("#sizey").val(Math.round(box.max.y - box.min.y));
    $("#sizez").val(Math.round(box.max.z - box.min.z));

    $("#numVertex").val(giMeshSTL.geometry.vertices.length);
    $("#numFace").val(giMeshSTL.geometry.faces.length);
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
    var time = geoHE[0].times_visit;
    for(var i=0;i<geometry_.halfedges.length;i++){	


    	// if(geoHE[i].times_visit > time) continue;//一度結びつけたHEはスキップ
    	if(!geoHE[i].unVisited) continue;//一度結びつけたHEはスキップ
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
    		    geometry_.halfedges[i].pair_id = geoHE[j].prev_id;
    		    geometry_.halfedges[geoHE[j].prev_id].pair_id = i;
    		    geoHE[i].unVisited = false;
    		    geoHE[geoHE[j].prev_id].unVisited = false;
    		    // geoHE[i].times_visit++;
    		    // geoHE[geoHE[j].prev_id].times_visit++;
		    

    		    // console.log("i->" + i + ", j->" + j + ", i->" + geoHE[j].prev_id + ", pair->" + i);
    		}
     	    }
	    
     	}
    }

    geometry_ = resetHEUnVisit( geometry_);

    return geometry_;
}

function resetHEUnVisit( geometry_){

    for(var i=0;i<geometry_.halfedges.length;i++){
	geometry_.halfedges[i].unVisited = true;
    }

    return geometry_;
}

function isEqualVector3( v, w){

    if(!(v.x == w.x)) return false;
    if(!(v.y == w.y)) return false;
    if(!(v.z == w.z)) return false;

    return true;
}
