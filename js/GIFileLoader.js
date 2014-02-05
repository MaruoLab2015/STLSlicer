// document.write('<script src="js/GISTLLoader.js"></script>')

function dochange(event){
    console.log("dochange");
    
    var file = event.target.files[0];
    if(file){
	readfile(file);
    }
}

function readfile(file){
    console.log("readfile");

    var reader = new FileReader();
    reader.addEventListener('load', onLoaded);
    reader.addEventListener('error', onError);

    reader.readAsText(file, "utf-8");
}

function onLoaded(event){
    console.log("onLoaded")

    var str = event.target.result;
    document.querySelector("#msg").innerHTML = str;
    console.log("text has read");

    var geometry, cutPlane;
    geometry = new Geometry();//STLモデルの初期化
    cutPlane = new culcCutPlane();//切断平面の初期化
    iSGeometry = new Geometry()//断面のジオメトリ

    //STLデータのパース(アスキーのみ))
    geometry = stlParseASCII(str);

    
    //三角形の数だけ繰り返す
    for(var i=0;i<geometry.faces.length;i++){


	//あとで3点・２点とも同じ場合について考える
	
	//AB,BC,CAについてチェックを繰り返す
	var ivector = new Vector3();
	if((ivector = intersectPlaneAndline(cutPlane, geometry.faces[i].a, geometry.faces[i].b))){
	    iSGeometry.vertices.push(ivector);
	}
	if((ivector = intersectPlaneAndline(cutPlane, geometry.faces[i].b, geometry.faces[i].c))){
	    iSGeometry.vertices.push(ivector);
	}
	if((ivector = intersectPlaneAndline(cutPlane, geometry.faces[i].c, geometry.faces[i].a))){
	    iSGeometry.vertices.push(ivector);
	}


	
    }

    iSGeometry.mergeVertices();
    console.log(iSGeometry.vertices.length);

    

    //平面の方程式
    // console.log("x,y,z=(%d, %d, %d)",
    // 		cutPlane.x0,
    // 		cutPlane.y0,
    // 		cutPlane.z0
    // 	       );
    
}

//交差判定
//p:切断面, 線分AB:aとｂを結ぶ線分
function intersectPlaneAndline(p, a, b){
    
    //平面上の点P0
    var P0 = new Vector3(p.x0, p.y0, p.z0);

    //PA,PBベクトル
    var PA = new Vector3(a.x - P0.x, a.y - P0.y, a.z - P0.z);
    var PB = new Vector3(b.x - P0.x, b.y - P0.y, b.z - P0.z);

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
    AB = new Vector3(b.x - a.x, b.y - a.y, b.z - a.z);

    //交点とAの距離:交点とBの距離 = dot_PA : dot_PB
    var rate = Math.abs(dot_PA)/(Math.abs(dot_PA)+ Math.abs(dot_PB));

    var out = new Vector3();
    out.x = a.x + (AB.x * rate);
    out.y = a.y + (AB.y * rate);
    out.z = a.z + (AB.z * rate);    
    
    return out;
}

function stlParseASCII(data){
    
    var patternFace, patternNormal, patternVertex, result, text, normal, geometry, length;
    geometry = new Geometry;
    patternFace = /facet([\s\S]*?)endfacet/g;
    
    while(((result = patternFace.exec(data)) != null)){

	text = result[0];
	
	// 法線ベクトルの取得
	// patternNormal = /normal[\s]+([\-+]?[0-9]+\.?[0-9]*([eE][\-+]?[0-9]+)?)+[\s]+([\-+]?[0-9]*\.?[0-9]+([eE][\-+]?[0-9]+)?)+[\s]+([\-+]?[0-9]*\.?[0-9]+([eE][\-+]?[0-9]+)?)+/g;
	// while (((result = patternNormal.exec(text)) != null)) {

	//     console.log('(nx,ny,nz)=(%f, %f, %f)',parseFloat(result[1]) , parseFloat(result[3]), parseFloat(result[5]));
	    
	// }

	// 頂点の取得
	patternVertex = /vertex[\s]+([\-+]?[0-9]+\.?[0-9]*([eE][\-+]?[0-9]+)?)+[\s]+([\-+]?[0-9]*\.?[0-9]+([eE][\-+]?[0-9]+)?)+[\s]+([\-+]?[0-9]*\.?[0-9]+([eE][\-+]?[0-9]+)?)+/g;
	while (((result = patternVertex.exec(text)) != null)) {

	    geometry.vertices.push(new Vector3(parseFloat(result[1]), parseFloat(result[3]), parseFloat(result[5])));

	    // console.log('(x,y,z)=(%f, %f, %f)',parseFloat(result[1]) , parseFloat(result[3]), parseFloat(result[5]));

	}
	// console.log("length = %d", geometry.vertices.length);
	length = geometry.vertices.length;
	// for(var i=0; i < 3;i++){
	//      console.log("(x, y, z)=(%f, %f, %f))",
	// 		 geometry.vertices[length-(3-i)].x,
	// 		 geometry.vertices[length-(3-i)].y,
	// 		 geometry.vertices[length-(3-i)].z
	// 		);
	// }
	geometry.faces.push(new Face3(
	    geometry.vertices[length - 3],
	    geometry.vertices[length - 2],
	    geometry.vertices[length - 1]
	));

    }

    return geometry;
    
}

function onError(event){
    if(event.target.error.code == event.target.error.NOT_READABLE_ERR){
	alert("ファイルの読み込みに失敗しました");
    }else{
	alert("エラーが発生しました。" + event.target.error.code);
    }
}

function loadFile(){
    console.log("こんにちは");
}
