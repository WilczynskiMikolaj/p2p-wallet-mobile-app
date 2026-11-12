module.exports = ({ config }) => ({
  ...config,
  android: {
    ...config.android,
    package: config.android?.package || process.env.ANDROID_APPLICATION_ID || 'com.p2pwallet.mobile',
    ...(process.env.GOOGLE_SERVICES_JSON ? { googleServicesFile: process.env.GOOGLE_SERVICES_JSON } : {}),
  },
  extra: {
    ...config.extra,
    ...(process.env.EXPO_PUBLIC_EAS_PROJECT_ID ? {
      eas: { ...config.extra?.eas, projectId: process.env.EXPO_PUBLIC_EAS_PROJECT_ID },
    } : {}),
  },
});
