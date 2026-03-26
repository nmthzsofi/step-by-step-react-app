export default ({ config }) => ({
  ...config,
  ios: {
    ...config.ios,
    googleServicesFile: process.env.EAS_BUILD
      ? "secret:GOOGLE_SERVICES_PLIST"
      : "./GoogleService-Info.plist",
  },
  android: {
    ...config.android,
    googleServicesFile: process.env.EAS_BUILD
      ? "secret:GOOGLE_SERVICES_JSON"
      : "./google-services.json",
  },
});
