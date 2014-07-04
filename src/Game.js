require([
   
	'goo/entities/GooRunner',
	'goo/util/rsvp',
	'goo/renderer/TextureCreator',
	'goo/renderer/Texture',
	'goo/renderer/Camera',
	'goo/entities/components/CameraComponent',
	'goo/entities/components/ScriptComponent',
	
	'src/GroovySprite'

], function (	
	GooRunner,
	RSVP,
	TextureCreator,
	Texture,
	Camera,
	CameraComponent,
	ScriptComponent,
	
	GroovySprite
) {
	'use strict';
	
	/*************
	 * Constants *
	 *************/
	
	
	/********
	 * Init *
	 ********/
	var goo = new GooRunner({
		debugKeys: true,
		showStats: true,
		antialias: false,
		logo: false
	});
	window.goo = goo;
	
	goo.renderer.domElement.id 	= 'goo';

	goo.renderer.setClearColor(0.9, 0.9, 1, 1);
	goo.doRender = true;

	document.body.appendChild(goo.renderer.domElement);
	
	goo.worldHeight = 3;
	goo.ratio = goo.renderer.domElement.clientHeight / goo.renderer.domElement.clientWidth;
	
	// Object loading
	var textureSettings = {
		magFilter: 'NearestNeighbor',
		minFilter: 'NearestNeighborNoMipMaps',
		generateMipmaps: 'false'
	};
	var textureSettingsGroovy = {
		magFilter: 'NearestNeighbor',
		minFilter: 'NearestNeighborNoMipMaps',
		generateMipmaps: 'false'
	};
	
	var texturePromise = new RSVP.Promise();
	var groovyPromise = new RSVP.Promise();
	
	var textureCreator = new TextureCreator();
	var spriteTexture = textureCreator.loadTexture2D('res/sprites/tower.png',textureSettings, function () {	texturePromise.resolve()});
	var spriteGroovyMap = textureCreator.loadTexture2D('res/sprites/tower_h.png',textureSettingsGroovy, function () {groovyPromise.resolve();});
	
	
	new RSVP.all([texturePromise, groovyPromise]).then(init);
	
	function init() {
		var spriteRatio = spriteTexture.image.height / spriteTexture.image.width;
		
		var gameObject = new GroovySprite(goo, 1/spriteRatio, 1, 8, spriteTexture, spriteGroovyMap);
		
		var camera = new Camera();
		camera.setProjectionMode(Camera.Parallel);
		goo.worldWidth = goo.worldHeight / spriteRatio;
		camera.setFrustum(0, 10, -goo.worldWidth/2, goo.worldWidth/2, goo.worldHeight/2, -goo.worldHeight/2);
		
		var cameraEntity = goo.world.createEntity("CameraEntity");
		cameraEntity.setComponent(new CameraComponent(camera));
		cameraEntity.set([0,0,1]);
		cameraEntity.addToWorld();
		
		gameObject.entity.setComponent(new ScriptComponent({
			run: function (entity) {
				var t = entity._world.time;
				var tpf = entity._world.tpf;
				
				gameObject.material.shader.uniforms.grooveDir = [Math.sin(t/2.0),1.0,-Math.sin(t/2.0)];
			}
		}));
	}
});