import React from "react"
import { RenderingContext, BROWSER } from "./src/utils/renderingContext";
// import mobx from "mobx";
import { Layout, Provider } from "./src/components/Layout"

// import '@babel/polyfill';

// mobx.configure({ enforceActions: "observed" });

export const wrapPageElement = ({ element, props }, b) => {
  return <Layout {...props}>{element}</Layout>;
}

export const wrapRootElement =  ({ element, ...rest }) => {
  return (
    <RenderingContext.Provider value={BROWSER}><Provider>
      {element}
    </Provider></RenderingContext.Provider>
  )
}

/*
export const onServiceWorkerUpdateReady = () => {
  const answer = window.confirm(
    `This application has been updated. ` +
      `Reload to display the latest version?`
  );

  if (answer === true) {
    window.location.reload()
  }
}

export const registerServiceWorker = () => true;
*/
