// int GROOVE_LEVELS defined default=8
// int GROOVE_HEIGHT defined default=3
uniform vec2 RENDERER_SCALE;
uniform vec2 TEXTURE_SIZE;
uniform sampler2D texture;
uniform sampler2D grooveTexture;
uniform vec3 grooveDir;

varying vec4 vWorldPos;
varying vec4 texCoord0;

vec2 grooveDisplacement (int level) {
	vec2 grooveScale = (RENDERER_SCALE - vec2(1.0))/2.0;
	return -grooveDir.xz*grooveScale* float(level)/float(GROOVE_LEVELS);
}

bool fallsOnRange (vec2 coord) {
	return coord.x > 0.0 && coord.x < 1.0 &&
		coord.y > 0.0 && coord.y < 1.0;
}

float lightFromGroove (float groove) {		
	float lightApport = 0.5;
	return groove*lightApport + (1.0-lightApport);
}

void main(void) {
	vec2 texCoord = texCoord0.xy * RENDERER_SCALE - (RENDERER_SCALE - vec2(1.0))/2.0;
	vec2 pixelCoord = texCoord * TEXTURE_SIZE;
	vec2 texDelta = (ceil(pixelCoord) - pixelCoord)/TEXTURE_SIZE;
	vec2 displ1 = grooveDisplacement(1);
	vec2 grooveCoord = texCoord;
	vec4 color = vec4(0.0);
	vec4 groove = vec4(0.0);
	
	int max = -1;
	int maxI = -1;
	for (int i = GROOVE_LEVELS; i >= 0; --i) {
		vec2 displ = grooveDisplacement(i);
		grooveCoord = texCoord + displ;
		
		if (fallsOnRange(grooveCoord)
			|| fallsOnRange(grooveCoord -= displ1)) {
			groove = texture2D(grooveTexture, grooveCoord);
			int g = int(groove.r * float(GROOVE_LEVELS));
			
			if (g >= i && g >= max && maxI - i < g - max - 1) {
				color = texture2D(texture, grooveCoord);
				
				color *= lightFromGroove(groove.r);
				
				max = g;
				maxI = i;
			}
		}
	}
	
	if (color.a <= 0.0) {
		discard;
	}
	gl_FragColor = color;
}