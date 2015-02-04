document.write('<script type="text/javascript" src="js/jszip.min.js"></script>');
function downloadFileAs(fileFormat){

	if(giISGeometries.length < 1){
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

		console.log(fileFormat);
		if(fileFormat == 'hpgl'){
			str += isGeometryToHPGL( giISGeometries[i].geometry);
		}else if(fileFormat == 'csv'){

			str += isGeometryToCSV( giISGeometries[i].geometry);
		}
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
		if(fileFormat == 'hpgl'){
			title += ".hpgl";
		}else if(fileFormat == 'csv'){
			title += '.csv';
		}
		zip.file( title, str);
		str = "";
		num++;
    }

	var content = zip.generate();
    location.href="data:application/zip;base64,"+content;

}

function isGeometryToCSV( geometry_){

   
    var str = new String;
    var n = geometry_.vertices.length;

    for(var i=0;i< n ;i++){

		str += geometry_.vertices[ i].x;
		str += ",";
		str += geometry_.vertices[ i].z;
		str += "\n";
    }

    return str;
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
