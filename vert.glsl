precision mediump float;

varying vec2 vpos;
attribute vec2 position;

void main() {
  gl_Position = vec4(position, 0, 1);
  vpos = position;
}
