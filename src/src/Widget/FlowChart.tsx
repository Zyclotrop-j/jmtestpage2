import React from 'react';
import styled from 'styled-components';
import { Box } from 'grommet';
import Observer from '@researchgate/react-intersection-observer';

interface Props {

}

export const uiSchema = {
  graph: {
    "ui:widget": "textarea"
  }
};

const schema = {
  "title": "componentflowchart",
  "type": "object",
  "properties": {
    "graph": {
      "description": "mermaid graph - see https://mermaidjs.github.io/",
      "type": "string",
      "ui:widget": "textarea"
    },
    "theme": {
      "description": "Theme of the chart - see https://mermaidjs.github.io/",
      "default": "neutral",
      "enum": ["dark", "default", "forest", "neutral", "none"]
    }
  }
};

const FadeGraph = styled.div`
  opacity: ${props => props?.visible ? 1 : 0};
  transition: opacity 0.2s;
`;

export class FlowChart extends React.PureComponent<Props> {

  public constructor(props) {
    super(props);
    this.state = { visible: false };
    this.handleVisibilityChange = this.handleVisibilityChange.bind(this);
  }

  private handleVisibilityChange(event) {
    const { _id, graph, theme } = this.props;
    if(this.state.__html) {
      this.setState({
        visible: event.isIntersecting
      });
      return;
    }
    this.setState({
      __html: " "
    });
    import(
      /* webpackPrefetch: true */
      /* webpackMode: "lazy" */
      "mermaid"
    ).then(i => {
      const mermaidAPI = i.default;
      mermaidAPI.initialize({
        startOnLoad: false,
        logLevel: 3,
        theme: (!theme || theme === "none" || theme === null) ? null : theme,
      });
      const rerender = () => {
        try {
          if(graph) {
            const innerHTML = mermaidAPI.render(`id-${_id}-flow-graph`, graph, () => null);
            this.setState({ __html: innerHTML });
          }
        } catch(e) {
          console.error(e);
        }
      };
      try {
        if(graph) {
          const innerHTML = mermaidAPI.render(`id-${_id}-flow-graph`, graph, () => null);
          this.setState({
            visible: event.isIntersecting,
            __html: innerHTML,
            rerender
          });
        }
      } catch(e) {
        console.error(e);
        this.setState({
          visible: event.isIntersecting,
          __html: "  ",
          rerender
        });
      }

    })
  };

  componentDidUpdate(prevProps) {
    if (this.state.rerender && this.props.graph !== prevProps.graph) {
      this.state.rerender(this.props.userID);
    }
  }

  public render() {
    const { _id, className, gridArea, a11yTitle } = this.props;
    const { __html = "", visible } = this.state;

    return (<Observer key="placeholder" onChange={this.handleVisibilityChange}>
      <Box className={className} gridArea={gridArea} a11yTitle={a11yTitle}>
        <FadeGraph visible={visible && __html.trim()} dangerouslySetInnerHTML={{ __html }} />
      </Box>
    </Observer>);
  }
}
