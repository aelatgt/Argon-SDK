var particleGeometry = new THREE.PlaneGeometry(0.4, 0.4, 1, 1);
var particleMaterial = new THREE.MeshLambertMaterial({ color: 0xFFFFFF, shading: THREE.FlatShading, overdraw: true });
var pArray = new Array();
var numParticles = 200;
var parentParticle = new THREE.Object3D();

function Particle() {
    var m_position;
    var m_velocity;
    var m_acceleration;
    var m_timeStep;
    var m_mesh;
}

Particle.prototype.init = function() {
    this.m_position = new THREE.Vector3(Math.random()*100 - 500,Math.random()*30,0);
    this.m_velocity = new THREE.Vector3(new THREE.Vector3(Math.random()*30,0,0));
    this.m_acceleration = new THREE.Vector3(0,-9.8,0);
    this.m_timeStep = 0.1;
    this.m_mesh = new THREE.Mesh(particleGeometry, particleMaterial);
    parentParticle.add(this.m_mesh);
};

Particle.prototype.hide = function() {
    this.m_mesh.position.z = -100000;
}

Particle.prototype.show = function() {
   this.m_mesh.position.z = 0;
}

Particle.prototype.resetState = function() {
    this.m_position.set(Math.random()*100-50,Math.random()*30,0);
    this.m_velocity.set(Math.random()*10,0,0);
};

Particle.prototype.update = function() {
    this.m_position.z = parentParticle.position.z;
    this.m_position = this.m_position.addVectors(this.m_position, this.m_velocity.multiplyScalar(this.m_timeStep));
    this.m_velocity.y += this.m_acceleration.y * this.m_timeStep;
    this.m_velocity.x = Math.random() * 2 - 1;
    if (this.m_position.y < -10)
    {
	this.resetState();
    }
    this.m_mesh.position = this.m_position;
};
