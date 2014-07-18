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

	goo.renderer.setClearColor(0.60, 0.8, 0.55, 1);
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
	var textureSettings2 = {
		magFilter: 'NearestNeighbor',
		minFilter: 'NearestNeighborNoMipMaps',
		generateMipmaps: 'false'
	};
	var textureSettingsGroovy2 = {
		magFilter: 'NearestNeighbor',
		minFilter: 'NearestNeighborNoMipMaps',
		generateMipmaps: 'false'
	};
	
	var castleTexturePromise = new RSVP.Promise();
	var castleGroovyPromise = new RSVP.Promise();
	var towerTexturePromise = new RSVP.Promise();
	var towerGroovyPromise = new RSVP.Promise();
	var screwTexturePromise = new RSVP.Promise();
	var screwGroovyPromise = new RSVP.Promise();
	
	var textureCreator = new TextureCreator();
	var castleTexture = textureCreator.loadTexture2D('res/sprites/castle.png',textureSettings, function () { castleTexturePromise.resolve()});
	var castleGroovyTexture = textureCreator.loadTexture2D('res/sprites/castle_h.png',textureSettingsGroovy, function () { castleGroovyPromise.resolve();});
	var towerTexture = textureCreator.loadTexture2D('res/sprites/tower.png',textureSettings2, function () { towerTexturePromise.resolve()});
	var towerGroovyTexture = textureCreator.loadTexture2D('res/sprites/tower_h.png',textureSettingsGroovy2, function () { towerGroovyPromise.resolve();});
	var screwTexture = textureCreator.loadTexture2D('res/sprites/screw.png',null, function () {	screwTexturePromise.resolve()});
	var screwGroovyTexture = textureCreator.loadTexture2D('res/sprites/screw_h.png',null, function () {	screwGroovyPromise.resolve()}); 
	
	new RSVP.all([castleTexturePromise, castleGroovyPromise, towerTexturePromise, towerGroovyPromise, screwTexturePromise, screwGroovyPromise]).then(init);

	var grooveDir = [0,0,0];

	var lastMouse = {x: 0, y: 0};
	var changeGroove = false;

	document.addEventListener('mousemove', function (e) {
		if (!changeGroove) return;
		grooveDir [0] -= (e.pageX - lastMouse.x)/300;
		grooveDir [2] += (e.pageY - lastMouse.y)/300;

		lastMouse.x = e.pageX;
		lastMouse.y = e.pageY;

		grooveDir[0] = Math.max(-1.0, Math.min(1.0, grooveDir[0]));
		grooveDir[2] = Math.max(-1.0, Math.min(1.0, grooveDir[2]));
	});

	document.addEventListener('mousedown', function (e) {
		lastMouse.x = e.pageX;
		lastMouse.y = e.pageY;

		changeGroove = !changeGroove;
	});

	document.addEventListener('mousewheel', function (e) {
		if (!changeGroove) return;
		lastMouse.x = e.pageX;
		lastMouse.y = e.pageY;

		grooveDir[1] += Math.max(-1.0, Math.min(1.0, -e.wheelDelta || e.detail)) * 0.035;
		grooveDir[1] = Math.max(-1.0, Math.min(0.0, grooveDir[1]));
	});
	
	function run (entity) {
		var t = entity._world.time;
		var tpf = entity._world.tpf;
		
		entity.gameObject.material.shader.uniforms.grooveDir = grooveDir; //[Math.sin(t/2.0),1.0,-Math.sin(t/3.0)]
	}

	function init() {
		var castleRatio = castleTexture.image.height / castleTexture.image.width;
		var castleLevels = 8;
		var castle = new GroovySprite(goo, 1/castleRatio, 1, castleLevels, 1, castleTexture, castleGroovyTexture);
		castle.entity.set([-1, -0.5, 0]);
		castle.entity.setComponent(new ScriptComponent({run: run}));

		var towerRatio = towerTexture.image.height / towerTexture.image.width;
		var towerLevels = 8;
		var tower = new GroovySprite(goo, 1/towerRatio, 1, towerLevels, 1, towerTexture, towerGroovyTexture);
		tower.entity.set([1, -0.5, 0]);
		tower.entity.setComponent(new ScriptComponent({run: run}));

		var screwLevels = 16;
		var screwRatio = screwTexture.image.height / screwTexture.image.width;
		var screw = new GroovySprite(goo, 1/screwRatio, 1, screwLevels, (screwTexture.image.width/castleTexture.image.width)/(screwLevels/castleLevels), screwTexture, screwGroovyTexture);
		screw.entity.set([0, 1, 0]);
		screw.entity.setComponent(new ScriptComponent({run: run}));
		
		var camera = new Camera();
		camera.setProjectionMode(Camera.Parallel);
		goo.worldWidth = goo.worldHeight / castleRatio;
		camera.setFrustum(0, 10, -goo.worldWidth/2, goo.worldWidth/2, goo.worldHeight/2, -goo.worldHeight/2);
		
		var cameraEntity = goo.world.createEntity("CameraEntity");
		cameraEntity.setComponent(new CameraComponent(camera));
		cameraEntity.set([0,0,1]);
		cameraEntity.addToWorld();
	}
});