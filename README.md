## OTA Update Setup

This app is configured for EAS Update with channels in [eas.json](eas.json).

### Publish an update

- Preview: npm run update:preview -- --message "your message"
- Production: npm run update:production -- --message "your message"

### Important

- After changing native update settings, create and install one new build first.
- Run: eas build --profile preview --platform android
- Run: eas build --profile production --platform android
- OTA updates only apply to installed builds with matching runtime and channel.
