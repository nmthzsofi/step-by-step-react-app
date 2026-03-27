import i18n from "i18next";
import { initReactI18next } from "react-i18next";
import { NativeModules, Platform } from "react-native";

const resources = {
  en: { translation: require("./en.json") },
  hu: { translation: require("./hu.json") },
};

const deviceLocale =
  Platform.OS === "ios"
    ? NativeModules.SettingsManager?.settings?.AppleLocale ||
      NativeModules.SettingsManager?.settings?.AppleLanguages?.[0]
    : NativeModules.I18nManager?.localeIdentifier;

const languageCode = (deviceLocale || "hu").split(/[-_]/)[0];
const lng = ["en", "hu"].includes(languageCode) ? languageCode : "hu";

i18n.use(initReactI18next).init({
  resources,
  lng,
  fallbackLng: "hu",
  interpolation: { escapeValue: false },
});

export default i18n;
