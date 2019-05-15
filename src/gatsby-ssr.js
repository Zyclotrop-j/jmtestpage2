import React from "react"
import { useStaticRendering } from "mobx-react";
import { Layout, Provider } from "./src/components/Layout"

useStaticRendering(true);

export const wrapPageElement = ({ element, props, ...rest }, b) => {
  console.log("!!!!!", element, props, rest, b);
  return <Layout {...props}>{element}</Layout>
}

export const wrapRootElement = ({ element }) => {
  return (
    <Provider>
      {element}
    </Provider>
  )
}
