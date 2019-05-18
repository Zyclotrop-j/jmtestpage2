import React from 'react';
import styled from 'styled-components';

const PreviewStyle = styled.div`
  #A_4 {
    color: rgb(26, 13, 171);
    text-align: left;
    font: normal normal 400 normal 13px / 20.02px arial, sans-serif;
  }/*#A_4*/

  #H3_5 {
    color: rgb(26, 13, 171);
    cursor: pointer;
    display: inline-block;
    height: 23px;
    text-align: left;
    width: 512.906px;
    font: normal normal 400 normal 18px / 23.94px arial, sans-serif;
    margin: 0px;
  }/*#H3_5*/

  #CITE_8 {
    color: rgb(0, 102, 33);
    cursor: pointer;
    text-align: left;
    font: normal normal 400 normal 14px / 20.02px arial, sans-serif;
    padding: 1px 0px 0px;
  }/*#CITE_8*/

  #DIV_10 {
    bottom: 0px;
    color: rgb(34, 34, 34);
    display: inline;
    left: 0px;
    position: relative;
    right: 0px;
    text-align: left;
    top: 0px;
    user-select: none;
    font: normal normal 400 normal 13px / 20.02px arial, sans-serif;
    margin: 1px 3px 0px;
  }/*#DIV_10*/

  #SPAN_12 {
    bottom: 37.5px;
    color: rgb(68, 68, 68);
    cursor: default;
    display: block;
    height: 0px;
    left: 0px;
    position: absolute;
    right: 581px;
    text-align: center;
    top: 7.5px;
    width: 0px;
    user-select: none;
    border-top: 5px solid rgb(0, 102, 33);
    border-right: 4px solid rgba(0, 0, 0, 0);
    border-bottom: 0px solid rgb(0, 102, 33);
    border-left: 4px solid rgba(0, 0, 0, 0);
    font: normal normal 700 normal 11px / 27px arial, sans-serif;
    margin: -4px 0px 0px 3px;
  }/*#SPAN_12*/

  #DIV_18 {
    color: rgb(84, 84, 84);
    height: 40px;
    text-align: left;
    text-decoration: none solid rgb(84, 84, 84);
    width: 592px;
    column-rule-color: rgb(84, 84, 84);
    perspective-origin: 296px 20px;
    transform-origin: 296px 20px;
    caret-color: rgb(84, 84, 84);
    border: 0px none rgb(84, 84, 84);
    font: normal normal 400 normal 13px / 20.02px arial, sans-serif;
    outline: rgb(84, 84, 84) none 0px;
  }/*#DIV_18*/
`;

export default ({ title = "", domain = "", path = "", description = "" }) => {
  console.log("title, domain, path, description", title, domain, path, description)
  return (
  <PreviewStyle>
    <a href={`https://${domain}${path}`} id="A_4"></a>
    <h3 id="H3_5">
    {title.slice(0, title.length > 65 ? 61 : 65)}{title.length > 65 ? " ..." : ""}
    </h3><br id="BR_6" />
    <cite id="CITE_8">https://{domain}{path}</cite>
    <div id="DIV_10">
      <span id="SPAN_12"></span>
    </div>
    <div id="DIV_18">
      {description.slice(0, description.length > 160 ? 157 : 160)}{description.length > 160 ? " ..." : ""}
    </div>
  </PreviewStyle>);
};
