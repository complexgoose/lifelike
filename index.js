const glsl = require('glslify');
const regl = require('regl')();

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

    draw({time: tick});
});
