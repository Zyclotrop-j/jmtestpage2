import React from "react"
// import mobx from "mobx";
import { Layout, Provider } from "./src/components/Layout"

// mobx.configure({ enforceActions: "observed" });

export const wrapPageElement = ({ element, props }, b) => {
  // Theme doesn't exist in admin-pages as they are general and not website-specific
  console.log("Browser!!!!!", props?.pageContext?.website?.themes, element);
  // props.pageContext.website.themes.map(i => i._id)
  return <Layout {...props}>{element}</Layout>
}

export const wrapRootElement =  ({ element, ...rest }) => {
  return (
    <Provider>
      {element}
    </Provider>
  )
}
