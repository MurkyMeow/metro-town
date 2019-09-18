// VERTEX

attribute vec3 position;
attribute vec2 texcoords;
attribute vec4 vertexColor;

uniform mat4 transform;
uniform vec4 lighting;
uniform vec2 textureSize;

varying vec2 textureCoord;
varying vec4 vColor;

void main() {
	textureCoord = texcoords / textureSize;
	vColor = vertexColor * lighting;
	gl_Position = transform * vec4(position, 1);
}

// FRAGMENT

precision mediump float;

uniform sampler2D sampler1;

varying vec2 textureCoord;
varying vec4 vColor;

void main() {
	gl_FragColor = texture2D(sampler1, textureCoord);

	#ifdef USE_COLOR
		gl_FragColor *= vColor;
	#endif
}
