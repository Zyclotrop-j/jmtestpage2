import React from "react"
// import mobx from "mobx";
import { Layout, Provider } from "./src/components/Layout"

// mobx.configure({ enforceActions: "observed" });

export const wrapPageElement = ({ element, props, ...rest }, b) => {
  console.log("Browser!!!!!", props.pageContext.data);

  return <Layout {...props}>{element}</Layout>
}

export const wrapRootElement = ({ element }) => {
  return (
    <Provider>
      {element}
    </Provider>
  )
}
