import React from "react"
// import mobx from "mobx";
import { Layout, Provider } from "./src/components/Layout"

// import '@babel/polyfill';

// mobx.configure({ enforceActions: "observed" });

export const wrapPageElement = ({ element, props }, b) => {
  return <Layout {...props}>{element}</Layout>;
}

export const wrapRootElement =  ({ element, ...rest }) => {
  return (
    <Provider>
      {element}
    </Provider>
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
