import React from "react";
import 'bootstrap/dist/css/bootstrap.min.css';
import '../style/index.scss';
import Flex from 'react-flexview';
import {Tab, Tabs, InputGroup, FormControl, Button, Card, ListGroup} from 'react-bootstrap';
import fragsrc from '../shaders/frag.glsl';
import vertsrc from '../shaders/vert.glsl';
import updatesrc from '../shaders/update.glsl';
import makeregl from 'regl';
import p5 from 'p5';
import { Helmet } from "react-helmet";


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

    this.state = {rule: getRandomRule(),
                  reglTick:null,cwidth:null,cheight:null,
                  tabKey: "out", bsize:1,
                  warningDismissed: false};

    this.glContainer = React.createRef();
    this.p5Container = React.createRef();

    this.handleRuleChange = this.handleRuleChange.bind(this);
    this.handleRandomize = this.handleRandomize.bind(this);
    this.hanldeBSizeChange = this.hanldeBSizeChange.bind(this);
    this.handleClear = this.handleClear.bind(this);
    this.handleShare = this.handleShare.bind(this);
    this.handleWarningDismiss = this.handleWarningDismiss.bind(this);
    this.handleTabSelect = this.handleTabSelect.bind(this);
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
    const params = new URLSearchParams(window.location.search);
    const rule = params.get("rule");
    const warningDismissed = window.localStorage.getItem("warningDismissed");
    this.setState({cwidth:container.clientWidth, cheight:container.clientHeight, window, rule, warningDismissed}, () => {
      this.setupP5Canvas(true);
      this.setupGlCanvas();
      if(!this.state.warningDismissed) this.setState({tabKey:"about"});
    });
  }

  componentDidMount() {
    this.setupCanvases();
  }

  handleRuleChange(e) {
    this.setState({rule: e.target.value}, () => {
      this.updateURL();
    });
  }

  handleRandomize(e) {
    this.setState({rule: getRandomRule()}, () => {
      this.updateURL();
      this.setupGlCanvas();
    });

  }

  hanldeBSizeChange(e) {
    this.setState({bsize: e.target.value});
  }

  handleClear(e) {
    this.setupP5Canvas();
  }

  updateURL() {
    const params = new URLSearchParams();
    params.set("rule", this.state.rule);
    const {origin,pathname} = this.state.window.location;
    const url = `${origin+pathname}?${params.toString()}`
    this.state.window.history.replaceState({path:url},'',url);
  }

  handleShare(e) {
    this.updateURL();
    navigator.clipboard.writeText(this.state.window.location.href);
  }

  handleWarningDismiss(e) {
    this.state.window.localStorage.setItem("warningDismissed", true);
    this.setState({warningDismissed: true});
  }

  handleTabSelect(k) {
    if(k==="link") {
      this.state.window.open("https://jack.strosahl.org", "_blank");
    } else {
      this.setState({tabKey:k});
    }
  }

  render() {
    return (
      <Flex column className="Full">
        <Helmet>
          <title>Life-like CA Shader</title>
        </Helmet>
        <Tabs activeKey={this.state.tabKey} 
              onSelect={this.handleTabSelect}>
          <Tab eventKey="out" title="Output">
            <Flex column className="Full">
              <Flex grow ref={this.glContainer}>
                {/* Regl will put canvas here */}
              </Flex>
              <Flex style={{marginBottom:"1em"}}>
                <InputGroup style={{width:"25em",margin:"0 1em 0 1em"}}>
                  <InputGroup.Prepend>
                    <InputGroup.Text>Rule</InputGroup.Text>
                  </InputGroup.Prepend>
                  <FormControl value={this.state.rule} onChange={this.handleRuleChange} htmlSize={19}/>
                  <InputGroup.Append>
                    <Button variant="danger" onClick={this.handleRandomize}>Randomize</Button>
                    <Button onClick={this.setupGlCanvas}>Run</Button>
                  </InputGroup.Append>
                </InputGroup>
                <Button variant="success" onClick={this.handleShare}>Copy URL</Button>
              </Flex>
            </Flex>
          </Tab>
          <Tab eventKey="setup" title="Setup">
            <Flex column className="Full">
              <Flex grow ref={this.p5Container}>
                {/* p5 will put canvas here */}
              </Flex>
              <Flex style={{width:"30em", margin:"0 0 1em 1em"}}>
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
          <Tab eventKey="about" title="About">
            <Flex column className="full">
              {!this.state.warningDismissed &&
              <Card bg="primary" text="light" className="AboutCard">
                <Card.Header>Photosensitive Warning</Card.Header>
                <Card.Body>
                  
                  <Card.Text>
                    The 'output' tab has flashing lights and colors.  
                    If that's ok, you can dismiss this warning.  
                    Otherwise, I'll warn you on every reload.
                  </Card.Text>
                  <Button variant="danger" onClick={this.handleWarningDismiss}>Dismiss</Button>
                </Card.Body>
              </Card>}
              <Card bg="secondary" text="light" className="AboutCard">
                <Card.Header>What's this do?</Card.Header>
                <Card.Body>
                  <Card.Text>
                    This app runs
                    <a target="_blank" href="https://wikipedia.org/wiki/Life-like_cellular_automaton"> Life-like cellular automaton </a>
                    using shaders.  Doing so leverages your GPU's many cores to
                    compute cells' states in parallel.
                  </Card.Text>
                </Card.Body>
              </Card>
              <Card bg="success" text="light" className="AboutCard">
                <Card.Header>Output Tab</Card.Header>
                <Card.Body>
                  <Card.Text>
                    On the output tab, you'll see a canvas running a life-like CA.  
                    In the UI below it, you can set the rule of the CA,
                    randomize the rule, and (re)run the CA.
                    There's also a button to copy the URL for this CA.  
                    Anyone else can follow this link and see the output of the  
                    rule you're using.
                  </Card.Text>
                </Card.Body>
              </Card>
              <Card bg="warning" text="light" className="AboutCard">
                <Card.Header>Setup Tab</Card.Header>
                <Card.Body>
                  <Card.Text>
                    On the setup tab, you'll see a canvas with the intial condition
                    of the CA.  By clicking or dragging, you can paint which cells
                    will be alive when the CA starts.  This feature is a work
                    in progress, and has two issues.  First, this canvas is
                    inverted vertically.  Second, the intial conditions aren't
                    saved in the URL of a CA.
                  </Card.Text>
                </Card.Body>
              </Card>
              <Card bg="dark" text="light" className="AboutCard">
                <Card.Header>Credits</Card.Header>
                <Card.Body>
                  <Card.Text>
                    This app uses lots of libraries:
                    <ListGroup>
                      <ListGroup.Item variant="dark">
                        <a href="https://github.com/regl-project/regl">regl</a> for easier shaders in WebGL (output tab).
                        I also based my life-like shader on their
                        <a href="https://github.com/regl-project/regl/blob/master/example/life.js"> example</a>.
                      </ListGroup.Item>
                      <ListGroup.Item variant="dark">
                        <a href="https://p5js.org/">p5js</a> for easier 2D canvas
                        drawing (setup tab).
                      </ListGroup.Item>
                      <ListGroup.Item variant="dark">
                        <a href="https://www.gatsbyjs.com/docs/">Gatsby</a> for a React framework that builds to static files.
                      </ListGroup.Item>
                      <ListGroup.Item variant="dark">
                        <a href="https://github.com/glslify/glslify">glslify</a>,
                        <a href="https://github.com/glslify/glslify-loader"> glslify-loader</a>, and
                        <a href="https://github.com/hughsk/glsl-noise"> glsl-noise </a>
                        for glsl modules, loading them in webpack, and a simplex noise module, respectively.
                      </ListGroup.Item>
                      <ListGroup.Item variant="dark">
                        <a href="https://getbootstrap.com/">Bootstrap</a>, and
                        <a href="https://react-bootstrap.github.io/"> React Bootstrap </a> 
                        for UI styling and components.
                      </ListGroup.Item>
                    </ListGroup>
                  </Card.Text>
                </Card.Body>
              </Card>
            </Flex>
          </Tab>
          <Tab eventKey="link" title="By Jack Strosahl">

          </Tab>
        </Tabs>
      </Flex>
    );
  }
}
