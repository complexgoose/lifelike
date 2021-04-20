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
    this.state = {rule: getRandomRule(),reglTick:null,cwidth:null,cheight:null};

    this.glContainer = React.createRef();
    this.p5Container = React.createRef();

    this.handleRuleChange = this.handleRuleChange.bind(this);
    this.handleRandomize = this.handleRandomize.bind(this);
    this.setupCanvases = this.setupCanvases.bind(this);
    this.setupGlCanvas = this.setupGlCanvas.bind(this);
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
    const ctx = initcanvas.getContext('2d');
    const {width,height} = initcanvas;
    const r = Math.min(width,height)/4;
    const chance = 1;
    let [b,s] = this.getRule();
    pad(b);
    pad(s);
    
    // ctx.fillStyle = "#FF0000";
    // for(let x=(width/2)-r;x<=(width/2)+r;x++) {
    //   for(let y=(height/2)-r;y<=(height/2)+r;y++) {
    //     if(Math.floor(Math.random()*chance)===0)
    //       ctx.fillRect(x,y,1,1);
    //   }
    // }

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

  setupP5Canvas() {
    const node = this.p5Container.current.getElementsByTagName("canvas")[0];
    if(node !== undefined) node.remove();
    new p5((sketch) => {
      sketch.setup = () => {
        sketch.createCanvas(this.state.cwidth, this.state.cheight);
        sketch.stroke(255,0,0);
      }

      sketch.mousePressed = () => {
        if(sketch.mouseButton === sketch.LEFT) {
          sketch.point(sketch.mouseX, sketch.mouseY);
          sketch.print(sketch.mouseX, sketch.mouseY);
        }
      }
    }, this.p5Container.current);
  }

  setupCanvases() {
    const container = this.glContainer.current;
    this.setState({cwidth:container.clientWidth, cheight:container.clientHeight}, () => {
      this.setupP5Canvas();
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

  render() {
    return (
      <Flex column className="Full">
        <Tabs defaultActiveKey="out">
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

              </Flex>
            </Flex>
          </Tab>
        </Tabs>
      </Flex>
    );
  }
}
