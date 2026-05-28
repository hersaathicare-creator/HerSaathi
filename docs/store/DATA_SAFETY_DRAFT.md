# Google Play Data Safety Draft

This is a draft for Play Console. Do not submit it until final production services are confirmed.

Google states developers are responsible for complete and accurate declarations, including data handled by third-party SDKs. Review this again after billing, cloud deploy, subscriptions, analytics, or crash reporting are added.

## Current App Behavior

Local-only behavior:

1. Period data can stay on device.
2. Symptom logs can stay on device.
3. Daily check-ins can stay on device.
4. AI chat history can stay on device.
5. Local export/restore/delete is controlled by the user.

Optional cloud behavior:

1. Google sign-in uses Firebase Authentication.
2. Optional Firestore backup can upload selected wellness data.
3. Optional cloud AI sends limited context to Gemini/OpenAI through Firebase Functions after deployment.

Deferred:

1. Billing
2. Premium payments
3. Crash reporting
4. Analytics

## Data Collection Draft

### Personal Info

Email address:

```text
Collected: Yes, if user signs in with Google
Required: Optional
Purpose: Account management, cloud sync, app functionality
Shared: No direct sale or advertising sharing intended
```

Name/display name:

```text
Collected: Yes, if user enters profile name or signs in with Google
Required: Optional
Purpose: App functionality, personalization
Shared: No direct sale or advertising sharing intended
```

### Health And Fitness

Period entries, cycle setup, symptoms, mood check-ins:

```text
Collected: Yes if user enables cloud backup; otherwise processed locally
Required: Optional for cloud collection, core for app functionality
Purpose: App functionality, health/wellness tracking, reports
Shared: Processed by service providers when cloud sync/AI is enabled
```

### App Activity

AI chat content:

```text
Collected: Only if cloud AI is used or AI chat sync is explicitly enabled later
Required: Optional
Purpose: App functionality, AI wellness support
Shared: Sent to AI service providers only through backend when cloud AI is active
```

### Device Or Other IDs

Firebase Authentication UID:

```text
Collected: Yes when signed in
Required: Optional
Purpose: Account management, secure cloud document ownership
Shared: Service provider processing only
```

### Diagnostics

Crash logs/analytics:

```text
Collected: Not currently through a crash reporting SDK
Required: Not applicable
Purpose: Not applicable
Shared: Not applicable
```

If crash reporting is added later, update this section before release.

## Security Practices Draft

Data encrypted in transit:

```text
Yes, Firebase/Google/OpenAI API traffic uses HTTPS/TLS.
```

Data deletion request:

```text
Yes. App includes local data delete, cloud backup delete, and support deletion request email.
```

Independent security review:

```text
No.
```

## Important Play Console Notes

1. Internal-only testing tracks may not require the public Data Safety section, but closed/open/production tracks do.
2. A public Privacy Policy URL is required.
3. The Privacy Policy must match actual behavior.
4. Third-party SDK behavior must be reflected.
5. Re-check after adding payment, analytics, crash reporting, or ads.
