import React from 'react';
import styled from 'styled-components';
import xpackage from "../../package.json";
import preval from 'preval.macro';

const depstring = preval`
const xpackage = require("../../package.json");
const exp = Object.entries(xpackage.dependencies).map(([dependency, version]) => {
  const d = require(dependency+"/package.json");
  const author = d.author ? " by " + d.author : "";
  return d.name + " (Version " +d.version + ") under " + d.license + " license" + author;
});
module.exports = exp;
`;

export const privacyPolicy = ({
  name,
  addr,
  email,
  phone
}) => `
# Privacy Policy
This privacy policy will explain how our organization uses the personal data we collect from you when you use our website.
${name} is committed to providing quality services to you and this policy outlines our ongoing obligations to you in respect of how we manage your Personal Information.
We have adopted the Australian Privacy Principles (APPs) contained in the Privacy Act 1988 (Cth) (the Privacy Act). The NPPs govern the way in which we collect, use, disclose, store, secure and dispose of your Personal Information.
A copy of the Australian Privacy Principles may be obtained from the website of The Office of the Australian Information Commissioner at www.aoic.gov.au

## What is Personal Information and why do we collect it?
Personal Information is information or an opinion that identifies an individual. Examples of Personal Information we collect include: names, addresses, email addresses, phone and facsimile numbers.
This Personal Information is obtained in many ways including [interviews, correspondence, by telephone and facsimile, by email, via our website www.yourbusinessname.com.au, from your website, from media and publications, from other publicly available sources, from cookies- delete all that aren’t applicable] and from third parties. We don’t guarantee website links or policy of authorised third parties.
We collect your Personal Information for the primary purpose of providing our services to you, providing information to our clients and marketing. We may also use your Personal Information for secondary purposes closely related to the primary purpose, in circumstances where you would reasonably expect such use or disclosure. You may unsubscribe from our mailing/marketing lists at any time by contacting us in writing.
When we collect Personal Information we will, where appropriate and where possible, explain to you why we are collecting the information and how we plan to use it.

## Sensitive Information
Sensitive information is defined in the Privacy Act to include information or opinion about such things as an individual's racial or ethnic origin, political opinions, membership of a political association, religious or philosophical beliefs, membership of a trade union or other professional body, criminal record or health information.
Sensitive information will be used by us only:
  -	For the primary purpose for which it was obtained
  -	For a secondary purpose that is directly related to the primary purpose
  -	With your consent; or where required or authorised by law.

## Third Parties
Where reasonable and practicable to do so, we will collect your Personal Information only from you. However, in some circumstances we may be provided with information by third parties. In such a case we will take reasonable steps to ensure that you are made aware of the information provided to us by the third party.

## Disclosure of Personal Information
Your Personal Information may be disclosed in a number of circumstances including the following:
  -	Third parties where you consent to the use or disclosure; and
  -	Where required or authorised by law.

## Security of Personal Information
Your Personal Information is stored in a manner that reasonably protects it from misuse and loss and from unauthorized access, modification or disclosure.
When your Personal Information is no longer needed for the purpose for which it was obtained, we will take reasonable steps to destroy or permanently de-identify your Personal Information. However, most of the Personal Information is or will be stored in client files which will be kept by us for a minimum of 7 years.

## Access to your Personal Information
You may access the Personal Information we hold about you and to update and/or correct it, subject to certain exceptions. If you wish to access your Personal Information, please contact us in writing.
${name} will not charge any fee for your access request, but may charge an administrative fee for providing a copy of your Personal Information.
In order to protect your Personal Information we may require identification from you before releasing the requested information.

## Maintaining the Quality of your Personal Information
It is an important to us that your Personal Information is up to date. We  will  take reasonable steps to make sure that your Personal Information is accurate, complete and up-to-date. If you find that the information we have is not up to date or is inaccurate, please advise us as soon as practicable so we can update our records and ensure we can continue to provide quality services to you.

## Policy Updates
This Policy may change from time to time and is available on our website.

## Privacy Policy Complaints and Enquiries
If you have any queries or complaints about our Privacy Policy please contact us at:

${addr}
${email}
${phone}



`;

export const copyright = ({
  name,
  addr,
  email,
  phone,
  date
}) => `
# Copyright

© ${name} ${(new Date(date)).getFullYear()}

[${(new Date(date)).toDateString()}]

Except as permitted by the copyright law applicable to you, you may not reproduce or communicate any of the content on this website, including files downloadable from this website, without the permission of the copyright owner.

The Australian Copyright Act allows certain uses of content from the internet without the copyright owner’s permission. This includes uses by educational institutions and by Commonwealth and State governments, provided fair compensation is paid. For more information, see www.copyright.com.au and www.copyright.org.au.

The owners of copyright in the content on this website may receive compensation for the use of their content by educational institutions and governments, including from licensing schemes managed by Copyright Agency.

We may change these terms of use from time to time. Check before re-using any content from this website.
`;

export const GDPR = ({
  name,
  email,
  websitename,
  website
}) => `
## General Data Protection Regulation (GDPR)

We are a Data Controller of your information.
${name} legal basis for collecting and using the personal information described in this Privacy Policy depends on the Personal Information we collect and the specific context in which we collect the information:
  - ${name} needs to perform a contract with you
  - You have given ${name} permission to do so
  - Processing your personal information is in ${name} legitimate interests
  - ${name} needs to comply with the law


${name} will retain your personal information only for as long as is necessary for the purposes set out in this Privacy Policy.
We will retain and use your information to the extent necessary to comply with our legal obligations, resolve disputes, and enforce our policies.

If you are a resident of the European Economic Area (EEA), you have certain data protection rights.
If you wish to be informed what Personal Information we hold about you and if you want it to be removed from our systems, please contact us.

In certain circumstances, you have the following data protection rights:
  - The right to access, update or to delete the information we have on you.
  - The right of rectification.
  - The right to object.
  - The right of restriction.
  - The right to data portability
  - The right to withdraw consent

## Log Files

${website} follows a standard procedure of using log files.
These files log visitors when they visit websites.
All hosting companies do this and a part of hosting services' analytics.
The information collected by log files include internet protocol (IP) addresses, browser type, Internet Service Provider (ISP), date and time stamp, referring/exit pages, and possibly the number of clicks.
These are not linked to any information that is personally identifiable.
The purpose of the information is for analyzing trends, administering the site, tracking users' movement on the website, and gathering demographic information.

## Cookies and Web Beacons

Like any other website, ${website} uses 'cookies'.
These cookies are used to store information including visitors' preferences, and the pages on the website that the visitor accessed or visited.
The information is used to optimize the users' experience by customizing our web page content based on visitors' browser type and/or other information.

## Privacy Policies

You may consult this list to find the Privacy Policy for each of the advertising partners of ${website}.

Third-party ad servers or ad networks uses technologies like cookies, JavaScript, or Web Beacons that are used in their respective advertisements and links that appear on ${website}, which are sent directly to users' browser.
They automatically receive your IP address when this occurs.
These technologies are used to measure the effectiveness of their advertising campaigns and/or to personalize the advertising content that you see on websites that you visit.

Note that ${website} has no access to or control over these cookies that are used by third-party advertisers.

### Google Analytics

This website uses Google Analytics. It is set to not process any personal data including full IP annonymisation.
If you wish to opt-out nevertheless, you can do so <a aria-label="Google Analytics opt-out" href="#GA-Opt-Out">here</a>

### Third Party Privacy Policies

You may find a complete list of these Privacy Policies and their links here:

  - https://aws.amazon.com/privacy/
  - https://www.google.com/policies/privacy/
  - https://www.mailgun.com/privacy-policy
  - https://www.hetzner.com/rechtliches/datenschutz
  - https://www.mongodb.com/mongodb-management-service-privacy-policy
  - https://www.facebook.com/policy.php
  - https://websites.mingram.net/privacy
  - http://instagram.com/about/legal/privacy/
  - https://about.pinterest.com/de/privacy-policy
  - https://www.dropbox.com/terms#privacy
  - https://unsplash.com/privacy
  - https://wiki.osmfoundation.org/wiki/Privacy_Policy
  - https://www.gandi.net/en/contracts/terms-of-service

You can choose to disable cookies through your individual browser options.
To know more detailed information about cookie management with specific web browsers, it can be found at the browsers' respective websites.

## Children's Information

Another part of our priority is adding protection for children while using the internet.
We encourage parents and guardians to observe, participate in, and/or monitor and guide their online activity.

${website} does not knowingly collect any Personal Identifiable Information from children under the age of 13.
If you think that your child provided this kind of information on our website, we strongly encourage you to contact us immediately and
we will do our best efforts to promptly remove such information from our records.

## Consent

By using our website, you hereby consent to our Privacy Policy and agree to its terms.
`;

export const TermsAndConditions = ({
  name,
  email,
  websitename,
  website
}) => `
Terms and Conditions for ${name}

## Introduction

These Website Standard Terms and Conditions written on this webpage shall manage your use of our website,
${websitename} accessible at ${website}.

These Terms will be applied fully and affect to your use of this Website.
By using this Website, you agreed to accept all terms and conditions written in here.
You must not use this Website if you disagree with any of these Website Standard Terms and Conditions.

## Intellectual Property Rights

Other than the content you own, under these Terms, ${name} and/or its licensors own all the intellectual property rights and materials contained in this Website.
<a href="/licences">There is a full list of licensors (including used Open Source Software and Pictures) here.</a>

You are granted limited license only for purposes of viewing the material contained on this Website.

## Restrictions

You are specifically restricted from all of the following:

  - publishing any Website material in any other media;
  - selling, sublicensing and/or otherwise commercializing any Website material;
  - publicly performing and/or showing any Website material;
  - using this Website in any way that is or may be damaging to this Website;
  - using this Website in any way that impacts user access to this Website;
  - using this Website contrary to applicable laws and regulations, or in any way may cause harm to the Website, or to any person or business entity;
  - engaging in any data mining, data harvesting, data extracting or any other similar activity in relation to this Website;
  - using this Website to engage in any advertising or marketing.

Certain areas of this Website are restricted from being access by you and ${name} may further restrict access by you to any areas of this Website, at any time, in absolute discretion.
Any user ID and password you may have for this Website are confidential and you must maintain confidentiality as well.

## Your Content

In these Website Standard Terms and Conditions, "Your Content" shall mean any audio, video text, images or other material you choose to display on this or any commisioned or ordered Website.
By displaying Your Content, you grant ${name} a non-exclusive, worldwide irrevocable, sub licensable license to use, reproduce, adapt, publish, translate and distribute it in any and all media.

## Your Privacy

Please read <a href="/privacy">our Privacy Policy</a>.

Your Content must be your own and must not be invading any third-party’s rights.
${name} reserves the right to remove any of Your Content from this and any commisioned or ordered Website at any time without notice.

## No warranties

This Website is provided "as is," with all faults, and ${name} express no representations or warranties, of any kind related to this Website or the materials contained on this Website.
Also, nothing contained on this Website shall be interpreted as advising you.

## Limitation of liability

In no event shall ${name}, nor any of its officers, directors and employees, shall be held liable for anything arising out of or in any way connected with your use of this Website whether such liability is under contract.
${name}, including its officers, directors and employees shall not be held liable for any indirect, consequential or special liability arising out of or in any way related to your use of this Website.

## Indemnification

You hereby indemnify to the fullest extent ${name} from and against any and/or all liabilities, costs, demands, causes of action, damages and expenses arising in any way related to your breach of any of the provisions of these Terms.

## Severability

If any provision of these Terms is found to be invalid under any applicable law, such provisions shall be deleted without affecting the remaining provisions herein.

## Variation of Terms

${name} is permitted to revise these Terms at any time as it sees fit, and by using this Website you are expected to review these Terms on a regular basis.

## Assignment

The ${name} is allowed to assign, transfer, and subcontract its rights and/or obligations under these Terms without any notification.
However, you are not allowed to assign, transfer, or subcontract any of your rights and/or obligations under these Terms.

## Entire Agreement

These Terms constitute the entire agreement between ${name} and you in relation to your use of this Website, and supersede all prior agreements and understandings.

## Governing Law & Jurisdiction

These Terms will be governed by and interpreted in accordance with the laws of Australia or Germany,
and you submit to the non-exclusive jurisdiction of the state and federal courts located in au for the resolution of any disputes.
`;

export const Licences = ({
  name,
  others
}) => `
# Licences

## Open Source Licences

This project uses (build time and run time dependencies):

${depstring.map(i => "  - "+i).join("\n")}

Thank you!

## This website
The source-code of this website is open source.
Beware that the source code excludes all images, text, content and other data, which are seperatly licenced and copyright protected as outlined in the
<a href="/terms">terms</a>.
Find the source code creating this website under <a href="https://github.com/Zyclotrop-j/jmtestpage2">https://github.com/Zyclotrop-j/jmtestpage2</a>.

${others}

All pictures not in this list and not marked up otherwise, are copyright by ${name}.
`;

/*{
  // stages.slides.image.author.name|portfolioUrl|username|profileurl|plattformname|plattform
  // picture.author.name|portfolioUrl|username|profileurl|plattformname|plattform

};*/
