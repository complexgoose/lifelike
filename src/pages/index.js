import React from "react";
import 'bootstrap/dist/css/bootstrap.min.css';
import '../style/index.scss';
import Flex from 'react-flexview';
import {Tab, Tabs, InputGroup, FormControl, Button} from 'react-bootstrap';
import fragsrc from '../shaders/frag.glsl';
import vertsrc from '../shaders/vert.glsl';
import updatesrc from '../shaders/update.glsl';
import makeregl from 'regl';


function captureNums(rxp, s) {
  const match = rxp.exec(s);
  if (match === null) return null;
  const nums = match[1].split('')
                       .map((x)=>Number.parseFloat(x))
                       .filter((x)=>x<9);
  nums.splice(9);
  return nums;
}

export default class Index extends React.Component {
  constructor() {
    super();
    this.state = {rule: "B3/S01234567"};

    this.glContainer = React.createRef();
    this.reglTick = null;

    this.handleRuleChange = this.handleRuleChange.bind(this);
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
    if(this.reglTick !== null) this.reglTick.cancel();
    let node = container.getElementsByTagName("canvas")[0];
    if(node !== undefined) node.remove();
    node = document.createElement("canvas");
    node.width = container.clientWidth;
    node.height = container.clientHeight;
    container.appendChild(node);
    const regl = makeregl(node);
    function pad(arr, len=9, val=-1) {
      arr.push(...Array(len-arr.length).fill(val));
    }
    
    const initcanvas = document.createElement("canvas");
    initcanvas.width = container.clientWidth;
    initcanvas.height = container.clientHeight;
    const ctx = initcanvas.getContext('2d');
    const {width,height} = initcanvas;
    const r = Math.min(width,height)/4;
    const chance = 1;
    let [b,s] = this.getRule();
    pad(b);
    pad(s);
    
    ctx.fillStyle = "#FF0000";
    for(let x=(width/2)-r;x<=(width/2)+r;x++) {
      for(let y=(height/2)-r;y<=(height/2)+r;y++) {
        if(Math.floor(Math.random()*chance)===0)
          ctx.fillRect(x,y,1,1);
      }
    }

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
    
    this.reglTick = regl.frame(function({tick}) {
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
  }

  setupP5Canvas() {

  }

  componentDidMount() {
    this.setupGlCanvas();
  }

  handleRuleChange(e) {
    this.setState({rule: e.target.value}, () => this.getRule());
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
                <InputGroup style={{width:"21em"}}>
                  <InputGroup.Prepend>
                    <InputGroup.Text>Rule</InputGroup.Text>
                    
                  </InputGroup.Prepend>
                  <FormControl value={this.state.rule} onChange={this.handleRuleChange} htmlSize={19}/>
                  <InputGroup.Append>
                    <Button onClick={this.setupGlCanvas}>Run</Button>
                  </InputGroup.Append>
                </InputGroup>
              </Flex>
            </Flex>
          </Tab>
          <Tab eventKey="setup" title="Setup">

          </Tab>
        </Tabs>
      </Flex>
    );
  }
}
