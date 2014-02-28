document.write('<script type="text/javascript" src="js/jszip.min.js"></script>');
function downloadAsFile(){

    if(!PointData){
    	alert("交点を計算して下さい");
    	return;
    }

    var zip = new JSZip();
    zip.file("model000.csv", PointData);
    zip.file("model001.csv", PointData);
    var content = zip.generate();
    location.href="data:application/zip;base64,"+content;
}

function downloadAsHPGLFormat(){

    if(!giISGeometries){
    	alert("層を計算して下さい");
    	return;
    }

    var zip = new JSZip();
    var str = new String();
    var num = 0;

    //層の数だけ繰り返す
    for(var i=0;i<giISGeometries.length;i++){

    	var title = new String;
    	var layerNumber = new String;

	str += isGeometryToHPGL( giISGeometries[i].geometry);
	if(i==giISGeometries.length -1);
	else if(Math.abs(giISGeometries[i].geometry.vertices[0].y -
		giISGeometries[i+1].geometry.vertices[0].y) < 0.1 ){
	    console.log("continue");
	    continue;
	}
	    
	console.log(str);
	layerNumber += "0000";//五桁にする
    	layerNumber += num.toString(10);//１０進数で文字にする
    	layerNumber = layerNumber.slice(-5);
    	title += "model";
    	title += layerNumber;
    	title += ".hpgl";
	zip.file( title, str);
	str = "";
	num++;
    }

    var content = zip.generate();
    location.href="data:application/zip;base64,"+content;
    
}

function isGeometryToHPGL( geometry_){

   
    var str = new String;
    var n = geometry_.vertices.length;

    str += "PU;\n";
    for(var i=0;i< n ;i++){

	str += "PA"
	str += geometry_.vertices[ i].x;
	str += ",";
	// str += geometry_.vertices[i].y;
	// str += ",";
	str += geometry_.vertices[ i].z;
	str += ";\n";

	if(i==0) str += "PD;\n";
    }

    return str;
}
