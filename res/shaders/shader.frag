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

void main(void) {
	vec2 texCoord = texCoord0.xy * rendererScale - (rendererScale - vec2(1.0))/2.0;
	vec2 grooveCoord = texCoord;
	vec4 color = vec4(0.0);
	vec4 groove = vec4(0.0);
	
	int max = -1;
	for (int i = GROOVE_LEVELS; i >= 0; --i) {
		grooveCoord = texCoord + grooveDisplacement(i);
		
		if (grooveCoord.x > 0.0 && grooveCoord.x < 1.0 &&
			grooveCoord.y > 0.0 && grooveCoord.y < 1.0) {
			
			groove = texture2D(grooveTexture, grooveCoord);
			int g = int(groove.r * float(GROOVE_LEVELS));
			
			if (g == i && g >= max) {
				color = texture2D(texture, grooveCoord);
				float h = groove.r;
				
				float lightApport = 0.5;
				color *= h*lightApport + (1.0-lightApport);
				
				max = g;
			}
		}
	}
	
	if (color.a <= 0.0) { discard; }
	else gl_FragColor = color;
}