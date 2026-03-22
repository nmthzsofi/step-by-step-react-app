import i18n from "i18next";
import { initReactI18next } from "react-i18next";

const resources = {
  en: { translation: require("./en.json") },
  hu: { translation: require("./hu.json") },
};

i18n.use(initReactI18next).init({
  resources,
  lng: "en", // default language
  fallbackLng: "en",
  interpolation: { escapeValue: false },
});

export default i18n;
