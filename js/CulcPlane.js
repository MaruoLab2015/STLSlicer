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
    
}
