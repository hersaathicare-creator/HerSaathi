# HerSaathi Android Release Signing

HerSaathi release builds are signed locally by Gradle. EAS cloud signing is not required.

## Files

- Keystore file: `android/signing/hersaathi-upload-key.jks`
- Local signing properties: `android/signing/release-signing.properties`
- Template: `android/signing/release-signing.properties.example`
- Key alias: `hersaathi-upload`

The keystore and real signing properties are intentionally ignored by Git. Do not commit them.

## Local Properties

Create `android/signing/release-signing.properties` from the example file:

```properties
HERSAATHI_UPLOAD_STORE_FILE=signing/hersaathi-upload-key.jks
HERSAATHI_UPLOAD_STORE_PASSWORD=your-store-password
HERSAATHI_UPLOAD_KEY_ALIAS=hersaathi-upload
HERSAATHI_UPLOAD_KEY_PASSWORD=your-key-password
```

Gradle also accepts these same names from environment variables or user-level Gradle properties.

## Generate A Keystore

Run this from the project root:

```bat
keytool -genkeypair -v -storetype JKS -keystore android\signing\hersaathi-upload-key.jks -alias hersaathi-upload -keyalg RSA -keysize 2048 -validity 10000 -dname "CN=HerSaathi, OU=Release, O=HerSaathi, L=Kolkata, ST=West Bengal, C=IN"
```

## Current Local Upload Certificate

Add these fingerprints to Firebase for local release builds signed with this keystore:

```text
SHA-1: 05:EC:91:3A:30:12:FE:F1:55:38:56:BA:9B:96:86:17:31:5F:8E:82
SHA-256: 6B:F7:B7:ED:76:C9:E4:B5:B9:AA:DE:25:CC:89:C9:76:CB:35:8F:01:ED:8D:4D:00:E8:23:33:C5:33:8D:54:CA
```

## Backup Procedure

Back up these two files immediately:

- `android/signing/hersaathi-upload-key.jks`
- `android/signing/release-signing.properties`

Store backups in at least two safe places, such as encrypted cloud storage and an offline USB drive.

If this keystore is lost, future Google Play updates can be blocked until the upload key is reset in Play Console.

## Existing Play Console Apps

If HerSaathi has already been uploaded to Google Play with a different upload key, Google Play may reject AABs signed with this local keystore.

To keep version upgrade compatibility, use the same upload keystore already registered with Play Console, or request an upload key reset in Play Console before using a new local upload key.
