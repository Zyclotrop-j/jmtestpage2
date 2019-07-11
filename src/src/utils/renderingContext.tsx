import React from "react";

export const SSR = Symbol("IMPORTANT");
export const BROWSER = Symbol("DEFAULT");
export const UNKNOWN = Symbol("UNKNOWN");
export const RenderingContext = React.createContext(UNKNOWN);
