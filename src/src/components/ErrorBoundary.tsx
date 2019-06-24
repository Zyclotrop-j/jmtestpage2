import React from 'react';

export class ErrorBoundary extends React.Component {
  static getDerivedStateFromError(error) {
    // Update state so the next render will show the fallback UI.
    return { error, hasError: true };
  }
  constructor(props) {
    super(props);
    this.state = { hasError: false };
  }

  componentDidCatch(error, info) {
    // You can also log the error to an error reporting service
    console.error(error, info);
  }

  render() {
    const child = React.Children.only(this.props.children);
    const { title, id, name = "" } = this.props;
    if (this.state.hasError) {
      // You can render any custom fallback UI
      return <h1 id={id} title={title}>Something went wrong{name ? ` in ${name}` : ""}. Check {child.displayName}!</h1>;
    }

    return child;
  }
}
