THREE.HalfedgeIdCount = 0;
THREE.Halfedge = function( next_id, prev_id, pair_id){

    this.id          = THREE.HalfedgeIdCount++;
    this.vertex      = new THREE.Vector3();
    this.next_id     = next_id || 0;
    this.prev_id     = prev_id || 0;
    this.pair_id     = pair_id || 0;
    this.face        = new THREE.Face3();
    this.times_visit = 0;
    this.unVisited = true;
    this.isVertex = false;
}


THREE.Halfedge.prototype = {

    setNextHE: function( HE ){

	this.next_id = HE;
    },

    setPrevHE: function( HE ){

	this.prev_id = HE;
    },

    setPairHE: function( HE ){

	this.pair_id = HE;
    }
    
}
