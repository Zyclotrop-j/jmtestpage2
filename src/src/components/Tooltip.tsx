import React, { createRef, Component } from "react";
import { Button, Drop } from "grommet";

export default class Tooltip extends Component {
  state = {};
  ref = createRef();

  render() {
    const { over } = this.state;
    return (<>
        {this.props.target({
          ref: this.ref,
          onMouseOver: () => this.setState({ over: true }),
          onMouseOut: () => this.setState({ over: false })
        })}
        {this.ref.current && over && (
          <Drop stretch={false} align={{ top: "bottom", left: "left" }} target={this.ref.current} plain>
            {this.props.children}
          </Drop>
        )}
    </>);
  }
}
