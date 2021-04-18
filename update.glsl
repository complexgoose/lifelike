precision mediump float;
uniform sampler2D front;
uniform vec2 ssize;
varying vec2 vpos;

void main() {
    float neighbors = 0.0;
    for(int dx=-1;dx<=1;dx++) {
        for(int dy=-1;dy<=1;dy++) {
            neighbors += texture2D(front, vpos+vec2(dx,dy)/ssize).x;
        }
    }
    float state = texture2D(front, vpos).x;
    if(neighbors > 3.0 + state || neighbors < 3.0) {
        state = 0.0;
    } else {
        state = 1.0;
    }
    //state= neighbors/8.0;
    float color = state;
    gl_FragColor = vec4(vec3(color),1.0);
}