export default {
  name: 'Smart Todo Tracker',
  slug: 'smart-todo-tracker',
  version: '1.0.0',
  orientation: 'portrait',
  userInterfaceStyle: 'automatic',
  ios: {
    supportsTablet: true,
    bundleIdentifier: 'com.smarttodo.tracker',
  },
  android: {
    package: 'com.smarttodo.tracker',
    permissions: [
      'INTERNET',
      'RECEIVE_BOOT_COMPLETED',
      'VIBRATE',
      'SCHEDULE_EXACT_ALARM',
      'USE_EXACT_ALARM',
    ],
  },
  web: {
    favicon: './assets/favicon.png',
  },
  plugins: [
    'expo-notifications',
    'expo-secure-store',
  ],
  extra: {
    apiBaseUrl: 'http://192.168.0.197:3000/api',
    eas: {
      projectId: '83154a56-614a-4b7e-8a84-e3e072177c33',
    },
  },
};