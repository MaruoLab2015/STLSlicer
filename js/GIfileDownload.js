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
