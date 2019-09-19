// VERTEX

attribute vec2 position;
attribute vec2 texcoords;

uniform mat4 transform;
uniform vec2 textureSize;

varying vec2 textureCoord;

void main() {
	textureCoord = texcoords / textureSize;
	gl_Position = transform * vec4(position, 0, 1);
}

// FRAGMENT

precision mediump float;

uniform sampler2D sampler1;
uniform sampler2D sampler2;

varying vec2 textureCoord;

void main() {
    vec3 color1 = texture2D(sampler1, textureCoord).rgb;
    vec3 color2 = texture2D(sampler2, textureCoord).rgb;
	gl_FragColor = vec4(color1 * color2, 1.0);
}
