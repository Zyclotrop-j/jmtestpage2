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
  const proxyurl = xdata.find(i => i.title === "ciproxy").secret;
  const deploymentpath = xdata.find(i => i.title === "cipath").secret;

  const deploymenturl = `${proxyurl}${deploymentpath}?circle-token=${deploymentkey}`;
  const {
    subdomain = "www",
    domain,
    tld,
  } = parseDomain(deploymentdata.domain);

  const xbody = JSON.stringify({
    "build_parameters": {
      "PAGENAME": `${subdomain}`.toLowerCase(),
      "SUFFIX": `${domain}.${tld}`.toLowerCase(),
      "DNSNAME": `${domain}.${tld}`.toLowerCase(),
      "CUSTOMER": `c${deploymentdata.customer.replace(/[ ]/g, "")}`.toLowerCase(), // No spaces allowed!
      "WEBSITEID": deploymentdata._id,
      "TOKEN": `T${subdomain.replace(/[.]/g, "")}${domain}${tld}${deploymentdata.customer.replace(/[ .]/g, "")}${deploymentdata._id}`.substring(2, 28),
    }
  });

  // // TODO: Check the 'domain' first, only submit, if it is ours
  // https://dns.google.com/resolve?name=_w3jmtoken.mingram.net&type=TXT
  // -> "TZD6NEHQUB8FWG9BNWX3WGD"
  // x.Answer.some(i => JSON.parse(i.data) === "TZD6NEHQUB8FWG9BNWX3WGD")

  // WARNING: if subdomain is empty, we need to choose a different name
  // For that we default to "www" -> www.www.mingram.net & www.mingram.net
  try {
    const circlecijob = await fetch(deploymenturl, {
      body: xbody,
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
  const seconds = 60 * 10;
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
