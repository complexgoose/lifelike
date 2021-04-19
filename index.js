// Credit to https://github.com/regl-project/regl/blob/master/example/life.js
// For inspiration/help

const glsl = require('glslify');
let regl = require('regl')();

const initcanvas = document.createElement("canvas");
initcanvas.width = innerWidth;
initcanvas.height = innerHeight;
const ctx = initcanvas.getContext('2d');
const {width,height} = initcanvas;
const r = width/4;
const chance = 1;
ctx.fillStyle = "#FF0000";
for(let x=(width/2)-r;x<=(width/2)+r;x++) {
  for(let y=(height/2)-r;y<=(height/2)+r;y++) {
    if(Math.floor(Math.random()*chance)===0)
      ctx.fillRect(x,y,1,1);
  }
}
function pad(arr, len=9, val=-1) {
  arr.push(...Array(len-arr.length).fill(val));
}

let b = [3];
let s = [0,1,2,3,4,5,6,7];
pad(b);
pad(s);


function makeBuf() {
  return regl.framebuffer({
    color: regl.texture(initcanvas),
    depthStencil: false,
  })
}
let back = makeBuf();
let front = makeBuf();

const update = regl({
  frag: glsl.file('./update.glsl'),
  framebuffer: () => back,
});

const draw = regl({
  frag: glsl.file('./frag.glsl'),

  vert: glsl.file('./vert.glsl'),

  attributes: {
    position: [
        [-1,-1],
        [1,-1],
        [-1,1],
        [1,-1],
        [1,1],
        [-1,1]
    ]
  },

  uniforms: {
    color: [0, 0, 1, 1],
    time: regl.prop('time'),
    front: () => front,
    ssize: [width,height],
    b,
    s,
  },

  depth: {
      enable: false
  },

  count: 6
});

// let tick =0;
// draw({time: tick}, () => {
//   regl.draw();
//   update();
//   let temp = back;
//   back = front;
//   front = temp;
// });
// draw({time: tick}, () => {
//   regl.draw();
//   update();
//   let temp = back;
//   back = front;
//   front = temp;
// });

regl.frame(function({tick}) {
    regl.clear({
        color: [0, 0, 0, 1]
    });    

    draw({time: tick}, () => {
      regl.draw();
      update();
      let temp = back;
      back = front;
      front = temp;
    });
});
