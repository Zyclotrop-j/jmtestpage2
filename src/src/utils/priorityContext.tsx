import React from "react";

export const IMPORTANT = Symbol("IMPORTANT");
export const DEFAULT = Symbol("DEFAULT");
export const LOW = Symbol("LOW");
export const PRIORITIES = [LOW, DEFAULT, IMPORTANT];
export const PriorityContext = React.createContext();
