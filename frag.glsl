precision mediump float;

#pragma glslify: noise = require('glsl-noise/simplex/3d);

varying vec2 vpos;
uniform vec4 color;
uniform float time;
uniform sampler2D front;
void main() {
    gl_FragColor = texture2D(front, vpos);
}