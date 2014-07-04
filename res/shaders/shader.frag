uniform sampler2D texture;
uniform sampler2D grooveTexture;
uniform vec3 grooveDir;
uniform vec2 rendererScale;

varying vec4 vWorldPos;
varying vec4 texCoord0;

vec2 grooveDisplacement (int level) {
	vec2 grooveScale = (rendererScale - vec2(1.0))/2.0;
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
	vec2 texCoord = texCoord0.xy * rendererScale - (rendererScale - vec2(1.0))/2.0;
	vec2 grooveCoord = texCoord;
	vec4 color = vec4(0.0);
	vec4 groove = vec4(0.0);
	
	int max = -1;
	for (int i = GROOVE_LEVELS; i >= 0; --i) {
		grooveCoord = texCoord + grooveDisplacement(i);
		
		if (fallsOnRange(grooveCoord)) {
			
			groove = texture2D(grooveTexture, grooveCoord);
			int g = int(groove.r * float(GROOVE_LEVELS));
			
			if (g == i && g >= max) {
				color = texture2D(texture, grooveCoord);
				
				color *= lightFromGroove(groove.r);
				
				max = g;
			}
		}
	}
	
	if (color.a <= 0.0) {
		if (fallsOnRange(texCoord)) {
			color = texture2D(texture, texCoord);
		
			groove = texture2D(grooveTexture, texCoord);
			color *= lightFromGroove(groove.r)*0.5;
		}
		
		if (color.a <= 0.0) {
			discard;
		}
	}
	gl_FragColor = color;
}