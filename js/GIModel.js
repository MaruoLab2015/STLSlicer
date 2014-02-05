//3次元ベクトル
function Vector3(x, y, z){

    this.x = x || 0;
    this.y = y || 0;
    this.z = z || 0;
}


//面
function Face3(a, b,c){
    this.a = new Vector3(a.x, a.y, a.z);
    this.b = new Vector3(b.x, b.y, b.z);
    this.c = new Vector3(c.x, c.y, c.z)
}

//面と頂点を持ったジオメトリ(Geometry)
function Geometry(){

    //プロパティ(メンバ変数)
    this.vertices = [];//頂点軍
    this.faces = [];   //三角形の面
    this.lines = [];   //三角形の線分

}

//Geometryの関数
Geometry.prototype = {

    mergeVertices: function () {

	var verticesMap = {}; // Hashmap for looking up vertice by position coordinates (and making sure they are unique)
	var unique = [], changes = [];

	var v, key;
	var precisionPoints = 4; // number of decimal points, eg. 4 for epsilon of 0.0001
	var precision = Math.pow( 10, precisionPoints );
	var i,il, face;
	var indices, k, j, jl, u;

	// reset cache of vertices as it now will be changing.
	this.__tmpVertices = undefined;

	for ( i = 0, il = this.vertices.length; i < il; i ++ ) {

	    v = this.vertices[ i ];
	    key = Math.round( v.x * precision ) + '_' + Math.round( v.y * precision ) + '_' + Math.round( v.z * precision );

	    if ( verticesMap[ key ] === undefined ) {

		verticesMap[ key ] = i;
		unique.push( this.vertices[ i ] );
		changes[ i ] = unique.length - 1;

	    } else {

		//console.log('Duplicate vertex found. ', i, ' could be using ', verticesMap[key]);
		changes[ i ] = changes[ verticesMap[ key ] ];

	    }

	};


	// if faces are completely degenerate after merging vertices, we
	// have to remove them from the geometry.
	var faceIndicesToRemove = [];

	for( i = 0, il = this.faces.length; i < il; i ++ ) {

	    face = this.faces[ i ];

	    face.a = changes[ face.a ];
	    face.b = changes[ face.b ];
	    face.c = changes[ face.c ];

	    indices = [ face.a, face.b, face.c ];

	    var dupIndex = -1;

	    // if any duplicate vertices are found in a Face3
	    // we have to remove the face as nothing can be saved
	    for ( var n = 0; n < 3; n ++ ) {
		if ( indices[ n ] == indices[ ( n + 1 ) % 3 ] ) {

		    dupIndex = n;
		    faceIndicesToRemove.push( i );
		    break;

		}
	    }

	}

	for ( i = faceIndicesToRemove.length - 1; i >= 0; i -- ) {
	    var idx = faceIndicesToRemove[ i ];
	    
	    this.faces.splice( idx, 1 );

	    for ( j = 0, jl = this.faceVertexUvs.length; j < jl; j ++ ) {

		this.faceVertexUvs[ j ].splice( idx, 1 );

	    }

	}

	// Use unique set of vertices

	var diff = this.vertices.length - unique.length;
	this.vertices = unique;
	return diff;

    }
    // getName: function(){	
    // 	console.log("あいうえお");
    // 	return( this.name);
    // }
}


