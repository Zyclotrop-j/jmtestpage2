import React from "react"
import { RenderingContext, SSR } from "./src/utils/renderingContext";
// import { useStaticRendering } from "mobx-react";
import { Layout, Provider } from "./src/components/Layout";

// useStaticRendering(true);

export const wrapPageElement = ({ element, props }) => {
  return <Layout {...props}>{element}</Layout>
}

export const wrapRootElement = ({ element }) => {
  return (
    <RenderingContext.Provider value={SSR}><Provider>
      {element}
    </Provider></RenderingContext.Provider>
  )
}
