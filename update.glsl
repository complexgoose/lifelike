precision mediump float;
uniform sampler2D front;
uniform vec2 ssize;
varying vec2 vpos;

void main() {
    float neighbors = 0.0;
    for(int dx=-1;dx<=1;dx++) {
        for(int dy=-1;dy<=1;dy++) {
            if(dx==0 && dy==0) continue;
            neighbors += texture2D(front, vpos+vec2(dx,dy)/ssize).x;
        }
    }
    float state = texture2D(front, vpos).x;
    if(state==1.0 && neighbors > 3.0 || neighbors < 2.0) {
        state = 0.0;
    } else if (state==0.0 && neighbors == 3.0) {
        state = 1.0;
    }
    gl_FragColor = vec4(vec3(state),1.0);
}