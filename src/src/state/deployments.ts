import parseDomain  from "parse-domain";
import { toJS, observable, flow, action, computed, autorun } from "mobx";
import { request } from "./components";

export const deployment = observable.box(100);
export const isDeploying = observable.box(false);

const setDeployment = action((i) => {
  deployment.set(i);
});

const setIsDeploying = action((isIt) => {
  isDeploying.set(isIt);
});

export const doDeploy = async (deploymentdata) => {
  setDeployment(0);
  setIsDeploying(true);
  // deploymentdata = website
  const req = await request("https://zcmsapi.herokuapp.com/api/v1/clientsidesecret", {
    cache: "no-cache",
  }, {
    skipClientCheck: true,
  });
  const { data: xdata } = await req.json();
  const deploymentkey = xdata.find(i => i.title === "circleci").secret;
  const proxyurl = "https://usjdilkblg.execute-api.eu-central-1.amazonaws.com/defaultstage";
  const deploymenturl = `${proxyurl}/api/v1.1/project/github/Zyclotrop-j/jmtestpage2?circle-token=${deploymentkey}`;
  const {
    subdomain = "www",
    domain,
    tld,
  } = parseDomain(deploymentdata.domain);
  // WARNING: if subdomain is empty, we need to choose a different name
  // For that we default to "www" -> www.www.mingram.net & www.mingram.net
  try {
    const circlecijob = await fetch(deploymenturl, {
      body: JSON.stringify({
        "build_parameters": {
          "PAGENAME": `${subdomain}`.toLowerCase(),
          "SUFFIX": `${domain}.${tld}`.toLowerCase(),
          "DNSNAME": `${domain}.${tld}`.toLowerCase(),
          "CUSTOMER": `c${deploymentdata.customer.replace(/[ ]/g, "")}`.toLowerCase(), // No spaces allowed!
          "WEBSITEID": deploymentdata._id,
          "TOKEN": `T${subdomain.replace(/[.]/g, "")}${domain}${tld}${deploymentdata.customer.replace(/[ .]/g, "")}${deploymentdata._id}`.substring(2, 28),
        }
      }),
      headers: {
        "Content-Type": "application/json"
      },
      method: "POST",
      cache: "no-cache",
    });
  } catch(e) {
    // Will fail due to cors, but will trigger build - current workaround...
    console.warn(e);
  }
  let deploymentprogress = 0;
  const seconds = 60 * 30;
  setDeployment(deploymentprogress);
  const increaseDeployment = () => {
    deploymentprogress += (100 / seconds);
    setDeployment(deploymentprogress);
    if(deploymentprogress >= 100) return setDeployment(100);
    window.setTimeout(increaseDeployment, 1000);
  }
  increaseDeployment();
  window.setTimeout(() => setIsDeploying(false), 1000 * seconds);
  return;
};
