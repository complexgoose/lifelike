precision mediump float;
uniform sampler2D front;
varying vec2 vpos;

void main() {
    gl_FragColor = texture2D(front,vpos);
}