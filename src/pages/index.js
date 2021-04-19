import React from "react";
import 'bootstrap/dist/css/bootstrap.min.css';
import '../style/index.scss';
import Flex from 'react-flexview';
import {Tab, Tabs, Container, Row, Col, InputGroup} from 'react-bootstrap';
import fragsrc from 'raw-loader!glslify-loader!../shaders/frag.glsl';
import vertsrc from 'raw-loader!glslify-loader!../shaders/vert.glsl';
import updatesrc from 'raw-loader!glslify-loader!../shaders/update.glsl';


export default class Index extends React.Component {
  render() {
    return (
      <Flex column className="Full">
        <Tabs defaultActiveKey="out">
          <Tab eventKey="out" title="Output">
            <Flex column className="Full">
              <Flex grow id="canvas-container">
                <canvas className="Full" id="canvas-gl"/>
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
