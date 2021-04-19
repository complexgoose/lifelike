precision mediump float;
uniform sampler2D front;
uniform vec2 ssize;
varying vec2 vpos;

uniform mat3 b;
uniform mat3 s;

bool contains(mat3 mat, float val) {
    for(int x=0;x<=3;x++) {
        for(int y=0;y<=3;y++) {
            if(mat[x][y] < 0.0) break;
            if(mat[x][y] == val) return true;
        }
    }
    return false;
}

void main() {
    float neighbors = 0.0;
    for(int dx=-1;dx<=1;dx++) {
        for(int dy=-1;dy<=1;dy++) {
            if(dx==0 && dy==0) continue;
            neighbors += texture2D(front, vpos+vec2(dx,dy)/ssize).x;
        }
    }
    float state = texture2D(front, vpos).x;
    if(state==1.0 && !contains(s,neighbors)) {
        state = 0.0;
    } else if (state==0.0 && contains(b,neighbors)) {
        state = 1.0;
    }
    gl_FragColor = vec4(state,0.0,0.0,0.0);
}