import React from "react"
import { Layout, Provider } from "./src/components/Layout"

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
