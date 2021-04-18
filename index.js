const glsl = require('glslify');
let regl = require('regl')();

const initcanvas = document.createElement("canvas");
initcanvas.width = innerWidth;
initcanvas.height = innerHeight;
const ctx = initcanvas.getContext('2d');
const {width,height} = initcanvas;
const r = 50;
for(let x=(width/2)-r;x<=(width/2)+r;x++) {
  for(let y=(height/2)-r;y<=(height/2)+r;y++) {
    if(Math.floor(Math.random()*2)===0)
      ctx.fillRect(x,y,1,1);
  }
}
function makeBuf() {
  return regl.framebuffer({
    color: regl.texture(initcanvas),
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
  },

  depth: {
      enable: false
  },

  count: 6
});

regl.frame(function({tick}) {
    regl.clear({
        color: [0, 0, 0, 1]
    });    

    draw({time: tick}, () => {
      regl.draw();
      update();
    });

    let temp = back;
    back = front;
    front = temp;
});
