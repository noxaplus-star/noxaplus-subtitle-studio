# Changelog

All notable changes to this project are documented here. The format follows
[Keep a Changelog](https://keepachangelog.com/en/1.1.0/), and the project adheres to
[Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

## [1.0.0] - 2026-11-12

### Added

- Persian-first, RTL subtitle editor with a complete English interface and dark/light themes.
- Import of SRT, WebVTT, and NoxaPlus project JSON from files, drag and drop, or pasted text.
- Export previews and downloads for SRT, WebVTT, and project JSON, with clipboard copy.
- Inline editing of cue text and timing, plus add, split, merge, duplicate, delete, and sort.
- Timing tools to shift and scale the entire subtitle timeline.
- Quality validation for CPS, short and long cues, line length, line count, overlaps, empty
  text, negative timing, and end-before-start errors.
- Quality summary and per-cue issue navigation.
- Tag-aware Persian text cleanup with seven optional rules, live diff preview, and URL/email
  protection.
- Optional local video preview with active-cue overlay, seeking from cues, and follow playback.
- Project-wide undo and redo with 80 snapshots and typing coalescing.
- Debounced autosave to `localStorage`, validated restore, and a storage quota warning.
- Installable PWA with offline app-shell caching.
- Responsive layouts, keyboard shortcuts, focus trapping, reduced-motion support, and
  accessible labels.
- Unit test suite covering parsing, serialization, Persian rules, validation, operations, and
  project files.
- CI and GitHub Pages deployment workflows.

[Unreleased]: https://github.com/noxaplus-star/noxaplus-subtitle-studio/compare/v1.0.0...HEAD
[1.0.0]: https://github.com/noxaplus-star/noxaplus-subtitle-studio/releases/tag/v1.0.0
