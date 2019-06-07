import React from "react";

/* Lazy load - excludes them from SSR */

export default class Theme extends React.Component {
  constructor() {
    super();
    this.state = { Component: () => <div /> };
  }

  componentDidMount() {
    import("../components/pages/theme").then((imp) => this.setState({
      Component: imp.default
    }));
  }

  render() {
    const Component = this.state.Component;
    return <Component />;
  }
}
