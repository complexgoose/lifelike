import React from "react";
import 'bootstrap/dist/css/bootstrap.min.css';
import '../style/index.scss';
import Flex from 'react-flexview';
import {Tab, Tabs, Container, Row, Col, InputGroup} from 'react-bootstrap';
import fragsrc from 'raw-loader!glslify-loader!../shaders/frag.glsl';
import vertsrc from 'raw-loader!glslify-loader!../shaders/vert.glsl';
import updatesrc from 'raw-loader!glslify-loader!../shaders/update.glsl';
import makeregl from 'regl';

const GL_CANVAS_ID = "gl-container";

export default class Index extends React.Component {
  constructor() {
    super();
    this.glContainer = React.createRef();
    this.reglTick = null;
  }

  setupGlCanvas() {
    const container = this.glContainer.current;
    // let node = container.getElementById(GL_CANVAS_ID);
    // if(this.reglTick !== null) this.reglTick.cancel();
    // if(node !== null) node.remove();
    // let canvas = document.createElement("canvas");
    // canvas.width = container.clientWidth;
    // canvas.height = container.clientHeight;
    // canvas.id = GL_CANVAS_ID;
    // container.appendChild(canvas);
    const regl = makeregl(container);
  }

  componentDidMount() {
      this.setupGlCanvas();
  }

  render() {
    return (
      <Flex column className="Full">
        <Tabs defaultActiveKey="out">
          <Tab eventKey="out" title="Output">
            <Flex column className="Full">
              <Flex grow ref={this.glContainer}>

              </Flex>
              <Flex>
                {[0,1,2,3,4,5,6,7,8].map((x) => (
                  <div>
                    {x}<input type="checkbox"/>
                  </div>
                ))}
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
