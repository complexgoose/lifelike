precision mediump float;

#pragma glslify: noise = require('glsl-noise/simplex/3d');

varying vec2 vpos;
uniform vec4 color;
uniform float time;
uniform sampler2D front;
const vec4 white = vec4(1.0,1.0,1.0,1.0);

float posnoise(int z) {
    return (noise(vec3(vpos, float(z)+sin(time)))/2.)+.5;
}

void main() {

    float state = texture2D(front, vpos).x;

    gl_FragColor = mix(vec4(vec3(posnoise(0),posnoise(1),posnoise(2)), 1.0), white,1.0-state);
}