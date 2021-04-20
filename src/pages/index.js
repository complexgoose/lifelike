import React from "react";
import 'bootstrap/dist/css/bootstrap.min.css';
import '../style/index.scss';
import Flex from 'react-flexview';
import {Tab, Tabs, InputGroup, FormControl, Button} from 'react-bootstrap';
import fragsrc from '../shaders/frag.glsl';
import vertsrc from '../shaders/vert.glsl';
import updatesrc from '../shaders/update.glsl';
import makeregl from 'regl';
import p5 from 'p5';


function captureNums(rxp, s) {
  const match = rxp.exec(s);
  if (match === null) return null;
  const nums = match[1].split('')
                       .map((x)=>Number.parseFloat(x))
                       .filter((x)=>x<9);
  nums.splice(9);
  return nums;
}

function getRandomRule() {
  const b = [];
  const s = [];
  for(let x=0;x<=8;x++) {
    if(Math.random()<.5) b.push(x);
    if(Math.random()<.5) s.push(x);
  }
  return `B${b.join("")}/S${s.join("")}`;
}

export default class Index extends React.Component {
  constructor() {
    super();
    const params = new URLSearchParams(window.location.search);

    const rule = params.get("rule");

    this.state = {rule: rule || getRandomRule(),
                  reglTick:null,cwidth:null,cheight:null,
                  tabKey: "out", bsize:1};

    this.glContainer = React.createRef();
    this.p5Container = React.createRef();

    this.handleRuleChange = this.handleRuleChange.bind(this);
    this.handleRandomize = this.handleRandomize.bind(this);
    this.hanldeBSizeChange = this.hanldeBSizeChange.bind(this);
    this.handleClear = this.handleClear.bind(this);
    this.setupCanvases = this.setupCanvases.bind(this);
    this.setupGlCanvas = this.setupGlCanvas.bind(this);
    this.setupP5Canvas = this.setupP5Canvas.bind(this);
  }

  getRule() {
    const {rule} = this.state;
    const b = captureNums(/B(\d*?)\//, rule);
    const s = captureNums(/\/S(\d*)$/, rule);
    return [b,s];
  }

  setupGlCanvas() {
    const container = this.glContainer.current;
    if(this.state.reglTick !== null) this.state.reglTick.cancel();
    let node = container.getElementsByTagName("canvas")[0];
    if(node !== undefined) node.remove();
    node = document.createElement("canvas");
    node.width = this.state.cwidth;
    node.height = this.state.cheight;
    container.appendChild(node);
    const regl = makeregl(node);
    function pad(arr, len=9, val=-1) {
      arr.push(...Array(len-arr.length).fill(val));
    }
    
    const initcanvas = this.p5Container.current.getElementsByTagName("canvas")[0];
    const {width,height} = initcanvas;
    let [b,s] = this.getRule();
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
      frag: updatesrc,
      framebuffer: () => back,
    });
    
    const draw = regl({
      frag: fragsrc,
    
      vert: vertsrc,
    
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
        time: ({tick})=>tick*.005,
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
    
    const reglTick = regl.frame(function({tick}) {
        regl.clear({
            color: [0, 0, 0, 1]
        });    
    
        draw(() => {
          regl.draw();
          update();
          let temp = back;
          back = front;
          front = temp;
        });
    });
    this.setState({reglTick});
  }

  setupP5Canvas(init=false) {
    const node = this.p5Container.current.getElementsByTagName("canvas")[0];
    if(node !== undefined) node.remove();
    new p5((sketch) => {
      sketch.setup = () => {
        sketch.createCanvas(this.state.cwidth, this.state.cheight);
        sketch.fill(255,0,0);
        sketch.stroke(255,0,0);
        sketch.rectMode(sketch.CENTER);
        if(init) {
          let r = sketch.min(sketch.width,sketch.height)/2;
          sketch.square(sketch.width/2,sketch.height/2,r);
        }
      }

      sketch.isClicking = () => {
        const {mouseX, mouseY, width, height} = sketch;
        return sketch.mouseButton === sketch.LEFT &&
        this.state.tabKey==="setup" &&
        mouseX >= 0 && mouseX<width &&
        mouseY >= 0 && mouseY<height;
      }

      sketch.mousePressed = () => {
        const {mouseX, mouseY} = sketch;
        if(sketch.isClicking()) {
          sketch.square(mouseX,mouseY,this.state.bsize);
        }
      }

      sketch.mouseDragged = () => {
        const {mouseX,mouseY} = sketch;
        if(sketch.isClicking()) {
          sketch.square(mouseX,mouseY,this.state.bsize);
        }
      }


    }, this.p5Container.current);
  }

  setupCanvases() {
    const container = this.glContainer.current;
    this.setState({cwidth:container.clientWidth, cheight:container.clientHeight}, () => {
      this.setupP5Canvas(true);
      this.setupGlCanvas();
    });
  }

  componentDidMount() {
    this.setupCanvases();
  }

  handleRuleChange(e) {
    this.setState({rule: e.target.value});
  }

  handleRandomize(e) {
    this.setState({rule: getRandomRule()}, () => this.setupGlCanvas());
  }

  hanldeBSizeChange(e) {
    this.setState({bsize: e.target.value})
  }

  handleClear(e) {
    this.setupP5Canvas();
  }

  render() {
    return (
      <Flex column className="Full">
        <Tabs activeKey={this.state.tabKey} 
              onSelect={(k)=>this.setState({tabKey:k})}>
          <Tab eventKey="out" title="Output">
            <Flex column className="Full">
              <Flex grow ref={this.glContainer}>
                {/* Regl will put canvas here */}
              </Flex>
              <Flex>
                <InputGroup style={{width:"25em"}}>
                  <InputGroup.Prepend>
                    <InputGroup.Text>Rule</InputGroup.Text>
                  </InputGroup.Prepend>
                  <FormControl value={this.state.rule} onChange={this.handleRuleChange} htmlSize={19}/>
                  <InputGroup.Append>
                    <Button variant="danger" onClick={this.handleRandomize}>Randomize</Button>
                    <Button onClick={this.setupGlCanvas}>Run</Button>
                  </InputGroup.Append>
                </InputGroup>
              </Flex>
            </Flex>
          </Tab>
          <Tab eventKey="setup" title="Setup">
            <Flex column className="Full">
              <Flex grow ref={this.p5Container}>
                {/* p5 will put canvas here */}
              </Flex>
              <Flex style={{width:"30em"}}>
                <Button variant="danger" onClick={this.handleClear}>Clear</Button>
                <InputGroup.Prepend>
                  <InputGroup.Text>Brush Size</InputGroup.Text>
                </InputGroup.Prepend>
                <FormControl type="range" value={this.state.bsize}
                 min={1} max={Math.min(this.state.cwidth,this.state.cheight)/2}
                 onChange={this.hanldeBSizeChange}/>
              </Flex>
            </Flex>
          </Tab>
        </Tabs>
      </Flex>
    );
  }
}
