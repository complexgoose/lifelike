# GLSL Template

Minimal setup for writing shaders, including:

✅ Live reloading dev server via `npm start` from [budo](https://github.com/mattdesl/budo)

✅ Export for the web / GitHub pages via `npm run build`, e.g [this repo's site](http://jack.strosahl.org/glsl-template/)

✅ [glslify](https://github.com/glslify/glslify) for importing packages in GLSL

✅ [regl](https://github.com/regl-project/regl) for simpler JS (check out `index.js`)

✅ Ready to make shader toys!
* Javascript to setup our canvas and load the shaders, no changes needed: `index.js`
* Simple vertex shader passing along its position, no changes needed: `vert.glsl`
* Example fragment shader to get started: `frag.glsl`

## Usage
1. Make a repo from this template from the link above, or [here](https://github.com/jackstrosahl/glsl-template/generate)
2. Clone your repo, and set the working directory there
3. Install dependencies:
```
npm i
npm i -g browserify
npm i -g budo
```
4. Start the development server with `npm start`
5. Edit `index.js`, `frag.glsl`, and `vert.glsl`
6. Use `npm run build` to export your final result to the `docs` directory
7. Enable GitHub pages on the main branch's `docs` directory to put your result on the web
