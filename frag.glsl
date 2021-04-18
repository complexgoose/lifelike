precision mediump float;

#pragma glslify: noise = require('glsl-noise/simplex/3d);

varying vec2 vpos;
uniform vec4 color;
uniform float time;
void main() {
    gl_FragColor = vec4(color.rgb*noise(vec3(vpos*10.0, time*.005)),color.a);
}