# Security Policy

## Supported versions

NoxaPlus Subtitle Studio is a static, client-side application. Security fixes are provided
for the latest released major version.

| Version | Supported |
| --- | --- |
| 1.x | Yes |
| < 1.0 | No |

## Reporting a vulnerability

Please do not open a public GitHub issue for security problems.

Report privately to **NoxaPlus2025@gmail.com** with:

- A description of the issue and its impact.
- Steps to reproduce or a minimal proof of concept.
- Affected browsers or operating systems.
- Any suggested mitigation.

You can expect an acknowledgment within 7 days. Please allow time for a fix to be prepared
and released before disclosing the issue publicly.

## Scope

The application runs entirely in the browser. Areas of interest include:

- Cross-site scripting through subtitle text, file names, or imported project JSON.
- Unsafe handling of pasted content, markup, or generated export files.
- Service worker cache poisoning or unexpected network requests.
- Exposure of local drafts, video files, or preferences.
- Dependency vulnerabilities that affect the shipped bundle.

## Out of scope

- Issues that require a compromised browser, extension, or operating system.
- Denial of service caused by intentionally enormous local files.
- Social engineering or physical access to an unlocked device.
- Vulnerabilities in third-party browsers or video codecs.

## Privacy expectations

NoxaPlus Subtitle Studio does not operate a backend and does not upload subtitle or video
content. Drafts and preferences are stored only in the browser's `localStorage`. If you find
code that sends user content off the device, treat it as a security report.

## Dependencies

Dependencies are pinned in `package-lock.json`. Please report a vulnerable dependency only
if it is reachable from the application bundle or build tooling.
