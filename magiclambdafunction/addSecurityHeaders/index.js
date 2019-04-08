'use strict';
const http = require('http');

const reporturiurl = "https://<YOUR_URL>.report-uri.com"

exports.handler = (event, context, callback) => {
    
    //Get contents of response
    const response = event.Records[0].cf.response;
    const request = event.Records[0].cf.request;
    const headers = response.headers;
    const s3URL = request && request.origin && request.origin.custom && request.origin.custom.domainName;
    
    const getSHAs = () => new Promise((res, rej) => {
        if(!s3URL) {
            console.error("No s3URL found. Details:");
            console.error(JSON.stringify(event.Records[0].cf));
            return res({ scriptSHAs: ["'unsafe-inline'"], styleSHAs: ["'unsafe-inline'"] });
        }
        http.get('http://' + s3URL + '/SHAs.json', (resp) => {
          let data = '';
          resp.on('data', (chunk) => {
            data += chunk;
          });
          resp.on('end', () => {
              res(JSON.parse(data));
          });
        }).on("error", (err) => {
          rej(err);
        });
    });
    
    const fp = [
        "sync-xhr 'none'",
        "document-write 'none'"
    ];
    
     headers['strict-transport-security'] = [{key: 'Strict-Transport-Security', value: 'max-age=63072000; includeSubdomains; preload'}]; 
     headers['feature-policy'] = [{key: 'Feature-Policy', value: fp.join("; ")}]; 
     headers['x-content-type-options'] = [{key: 'X-Content-Type-Options', value: 'nosniff'}]; 
     headers['x-frame-options'] = [{key: 'X-Frame-Options', value: 'DENY'}]; 
     headers['x-xss-protection'] = [{key: 'X-XSS-Protection', value: '1; mode=block; report=' + reporturiurl + '/r/d/xss/enforce'}]; 
     headers['referrer-policy'] = [{key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin'}];
     
     headers["report-to"] = [{key: "Report-To", value: JSON.stringify({"group":"default","max_age":31536000,"endpoints":[{"url":"" + reporturiurl + "/a/d/g"}],"include_subdomains":true})}];
     headers["nel"] = [{ key: "NEL", value: JSON.stringify({"report_to":"default","max_age":31536000,"include_subdomains":true}) }];
     headers["expect-ct"] = [{ key: "Expect-CT", value: 'max-age=86400, enforce, report-uri="' + reporturiurl + '/r/d/ct/enforce"' }];
     
     
     getSHAs().then(shas => {
        const scriptSHAs = shas.scriptSHAs;
        const styleSHAs = shas.styleSHAs;
        //Set new headers 
        // 'strict-dynamic' + sha on external needed see https://www.w3.org/TR/CSP3/#external-hash
        // Chrome not shipped: https://codereview.chromium.org/2784753003/#ps1
        // Firefox not implemented https://bugzilla.mozilla.org/show_bug.cgi?id=1409200
        const csps = [
            "default-src 'none'",
            "script-src 'self' " + scriptSHAs.join(" "), // 'strict-dynamic' // no need for 'unsafe-inline'
            "base-uri 'none'",
            "frame-ancestors 'none'",
            "form-action 'none'",
            "child-src 'self'",
            "frame-src 'self'",
            "object-src 'none'",
            "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com/css ", // 'strict-dynamic' // 'unsafe-inline' needed for dynamic css // + styleSHAs.join(" ") // can't use because " Note that 'unsafe-inline' is ignored if either a hash or nonce value is present in the source list."
            "connect-src 'self' https://fonts.googleapis.com",
            "font-src 'self' data: https://fonts.gstatic.com",
            "img-src 'self' data:",
            "media-src 'self'",
            "worker-src 'self'",
            "manifest-src 'self'",
            "prefetch-src 'self'",
            // "sandbox allow-forms allow-orientation-lock allow-pointer-lock allow-presentation allow-same-origin allow-scripts allow-top-navigation",
            "block-all-mixed-content",
            "report-uri " + reporturiurl + "/r/d/csp/enforce"
        ];
        headers['content-security-policy'] = [{key: 'Content-Security-Policy', value: csps.join("; ")}];
         //Return modified response
        callback(null, response);
     });
};
