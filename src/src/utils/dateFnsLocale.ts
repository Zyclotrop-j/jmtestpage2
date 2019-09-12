
let dateFnsLang;
let dateFnsLangImport;
export function getLocale() {
  return dateFnsLangImport;
}
getLocale.getLocaleName = () => {
  return dateFnsLang;
};
getLocale.getLazy = () => {
  return new Promise((res, rej) => {
    if(typeof window !== 'undefined' && window.navigator) {
      try {
        const dateFnsLocales = ["af","ar-DZ","ar-SA","ar","be","bg","bn","ca","cs","cy","da","de","el","en-CA","en-GB","en-US","eo","es","et","fa-IR","fi","fr-CH","fr","gl","he","hr","hu","id","is","it","ja","ka","ko","lt","lv","mk","ms","nb","nl-BE","nl","nn","pl","pt-BR","pt","ro","ru","sk","sl","sr","sv","th","tr","ug","uk","vi","zh-CN","zh-TW"];
        const languageFound = navigator.languages.find(browserlangs => dateFnsLocales.some(availLang => availLang === browserlangs));
        import(
          /* webpackMode: "lazy" */
          `date-fns/locale/${languageFound}/index.js`
        ).then(({ default: lang }) => {
          dateFnsLang = languageFound;
          dateFnsLangImport = lang;
          res(lang);
        })
      } catch(e) {
        console.warn(e);
        rej(e);
      }
    }
  });
}
export default getLocale;
