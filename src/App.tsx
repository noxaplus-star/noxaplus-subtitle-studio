import { useEffect, useMemo, useRef, useState, type DragEvent as ReactDragEvent } from 'react';
import { CueList } from './components/CueList';
import { EmptyState } from './components/EmptyState';
import { ExportDialog } from './components/ExportDialog';
import { FixDialog } from './components/FixDialog';
import { Footer } from './components/Footer';
import { Header } from './components/Header';
import { HelpDialog } from './components/HelpDialog';
import { Icon } from './components/Icon';
import { Inspector } from './components/Inspector';
import { PasteDialog } from './components/PasteDialog';
import { TimingDialog } from './components/TimingDialog';
import { ToastProvider, useToast } from './components/Toasts';
import { Toolbar } from './components/Toolbar';
import { VideoPanel } from './components/VideoPanel';
import { SubtitleParseError } from './core/parse';
import { parseAny } from './core/project';
import { getSampleCues } from './core/sample';
import type { Cue, PersianFixOptions } from './core/types';
import { summarize, validateCues } from './core/validation';
import { useInstallPrompt } from './hooks/useInstallPrompt';
import { useProject } from './hooks/useProject';
import { isVideoFile, useVideo } from './hooks/useVideo';
import { I18nProvider, useI18n, type Language, type Theme, type TranslationKey } from './i18n';
import { loadStoredState, saveStoredState, type StoredState } from './storage';

const SUBTITLE_EXTENSION = /\.(srt|vtt|json)$/i;

type DialogName = 'export' | 'paste' | 'fix' | 'timing' | 'help';

interface StudioProps {
  initial: StoredState | null;
  lang: Language;
  theme: Theme;
  onToggleLanguage: () => void;
  onToggleTheme: () => void;
}

function Studio({ initial, lang, theme, onToggleLanguage, onToggleTheme }: StudioProps) {
  const { t } = useI18n();
  const notify = useToast();
  const project = useProject({
    cues: initial?.cues ?? [],
    format: initial?.format ?? 'srt',
    fileName: initial?.fileName ?? null,
  });
  const video = useVideo(() => notify(t('error.video'), 'error'));
  const { canInstall, install } = useInstallPrompt();

  const [dialog, setDialog] = useState<DialogName | null>(null);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [autoFocusId, setAutoFocusId] = useState<string | null>(null);
  const [autoScroll, setAutoScroll] = useState(initial?.autoScroll ?? true);
  const [dragging, setDragging] = useState(false);

  const subtitleInputRef = useRef<HTMLInputElement>(null);
  const videoInputRef = useRef<HTMLInputElement>(null);
  const dragDepth = useRef(0);
  const storageFailed = useRef(false);

  const issues = useMemo(() => validateCues(project.cues), [project.cues]);
  const summary = useMemo(() => summarize(project.cues, issues), [project.cues, issues]);

  const activeCue = useMemo<Cue | null>(() => {
    if (!video.hasVideo) return null;
    return (
      project.cues.find(
        (cue) =>
          cue.text.trim() !== '' && video.currentTime >= cue.start && video.currentTime < cue.end,
      ) ?? null
    );
  }, [project.cues, video.currentTime, video.hasVideo]);

  const hasContent = project.cues.length > 0 || video.hasVideo;

  useEffect(() => {
    document.documentElement.lang = lang;
    document.documentElement.dir = lang === 'fa' ? 'rtl' : 'ltr';
    document.title = t('app.documentTitle');
  }, [lang, t]);

  useEffect(() => {
    document.documentElement.dataset.theme = theme;
    const meta = document.querySelector('meta[name="theme-color"]');
    meta?.setAttribute('content', theme === 'light' ? '#f7f5f0' : '#0b0d12');
  }, [theme]);

  useEffect(() => {
    const timer = window.setTimeout(() => {
      const saved = saveStoredState({
        cues: project.cues,
        format: project.format,
        fileName: project.fileName,
        lang,
        theme,
        autoScroll,
      });
      if (!saved && !storageFailed.current) {
        storageFailed.current = true;
        notify(t('error.storage'), 'error');
      } else if (saved) {
        storageFailed.current = false;
      }
    }, 600);
    return () => window.clearTimeout(timer);
  }, [project.cues, project.format, project.fileName, lang, theme, autoScroll, notify, t]);

  const importText = (text: string, name: string, quiet = false): boolean => {
    try {
      const parsed = parseAny(text, name);
      const replacing = project.cues.length > 0;
      project.loadProject(parsed.cues, parsed.format, name || null);
      setSelectedId(null);
      setAutoFocusId(null);
      if (parsed.warnings.length > 0) {
        notify(t('import.warnings', { count: parsed.warnings.length }), 'info');
      }
      if (/\.json$/i.test(name)) {
        notify(t('import.projectLoaded', { count: parsed.cues.length }), 'success');
      } else if (replacing) {
        notify(t('import.replaced', { count: parsed.cues.length }), 'success');
      } else {
        notify(t('import.success', { count: parsed.cues.length }), 'success');
      }
      return true;
    } catch (error) {
      if (!quiet) {
        const code = error instanceof SubtitleParseError ? error.code : null;
        const key = code ? (`import.error.${code}` as TranslationKey) : 'import.error';
        notify(t(key), 'error');
      }
      return false;
    }
  };

  const importFile = async (file: File) => {
    try {
      const text = await file.text();
      importText(text, file.name);
    } catch {
      notify(t('import.error'), 'error');
    }
  };

  const loadVideoFile = (file: File) => {
    if (!isVideoFile(file)) {
      notify(t('import.unsupported'), 'error');
      return;
    }
    video.load(file);
    notify(t('import.video'), 'success');
  };

  const handleFiles = (files: File[]) => {
    const videoFile = files.find((file) => isVideoFile(file));
    const subtitleFile = files.find((file) => !isVideoFile(file) && SUBTITLE_EXTENSION.test(file.name));
    if (videoFile) loadVideoFile(videoFile);
    if (subtitleFile) void importFile(subtitleFile);
    if (!videoFile && !subtitleFile) notify(t('import.unsupported'), 'error');
  };

  const addCue = () => {
    const cue = project.addCue(selectedId);
    setSelectedId(cue.id);
    setAutoFocusId(cue.id);
    window.setTimeout(() => {
      document.getElementById(`cue-${cue.id}`)?.scrollIntoView({ block: 'nearest', behavior: 'smooth' });
    }, 80);
  };

  const deleteCue = (id: string) => {
    project.removeCue(id);
    if (selectedId === id) setSelectedId(null);
    notify(t('cues.deleted'), 'info');
  };

  const focusCue = (id: string) => {
    setSelectedId(id);
    document.getElementById(`cue-${id}`)?.scrollIntoView({ block: 'center', behavior: 'smooth' });
  };

  const loadSample = () => {
    const cues = getSampleCues(lang);
    project.loadProject(cues, 'srt', null);
    setSelectedId(null);
    setAutoFocusId(null);
    notify(t('import.success', { count: cues.length }), 'success');
  };

  const sortCues = () => {
    if (project.sortByTime()) notify(t('cues.sorted'), 'success');
  };

  const applyFix = (options: PersianFixOptions) => {
    const count = project.applyFix(options);
    notify(
      count > 0 ? t('fix.applied', { count }) : t('fix.none'),
      count > 0 ? 'success' : 'info',
    );
  };

  const shiftAll = (ms: number) => {
    const earliest = project.cues.reduce((min, cue) => Math.min(min, cue.start), Infinity);
    const applied = Math.max(Math.round(ms), Number.isFinite(earliest) ? -earliest : 0);
    project.shiftAll(applied);
    notify(t('timing.shiftDone', { value: applied }), 'success');
  };

  const scaleAll = (percent: number) => {
    const applied = Math.min(1_000, Math.max(10, Math.round(percent)));
    project.scaleAll(applied);
    notify(t('timing.scaleDone', { value: applied }), 'success');
  };

  const removeVideo = () => {
    video.remove();
    notify(t('video.removed'), 'info');
  };

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if (dialog) return;
      const target = event.target as HTMLElement | null;
      const interactive = target?.closest(
        'input, textarea, select, button, a, [contenteditable="true"], [role="button"], [role="switch"]',
      );
      const mod = (event.ctrlKey || event.metaKey) && !event.altKey;

      if (mod) {
        const key = event.key.toLowerCase();
        if (key === 'z') {
          event.preventDefault();
          if (event.shiftKey) project.redo();
          else project.undo();
          return;
        }
        if (key === 'o') {
          event.preventDefault();
          subtitleInputRef.current?.click();
          return;
        }
        if (key === 'e') {
          event.preventDefault();
          setDialog('export');
          return;
        }
      }

      if (interactive) return;
      if (event.key === '?') {
        event.preventDefault();
        setDialog('help');
        return;
      }
      if (event.code === 'Space') {
        if (video.hasVideo) {
          event.preventDefault();
          video.toggle();
        }
      }
    };

    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [dialog, project, video]);

  const onDragEnter = (event: ReactDragEvent<HTMLDivElement>) => {
    if (!Array.from(event.dataTransfer.types).includes('Files')) return;
    dragDepth.current += 1;
    setDragging(true);
  };

  const onDragOver = (event: ReactDragEvent<HTMLDivElement>) => {
    if (!Array.from(event.dataTransfer.types).includes('Files')) return;
    event.preventDefault();
    event.dataTransfer.dropEffect = 'copy';
  };

  const onDragLeave = () => {
    dragDepth.current = Math.max(0, dragDepth.current - 1);
    if (dragDepth.current === 0) setDragging(false);
  };

  const onDrop = (event: ReactDragEvent<HTMLDivElement>) => {
    event.preventDefault();
    dragDepth.current = 0;
    setDragging(false);
    const files = Array.from(event.dataTransfer.files);
    if (files.length > 0) handleFiles(files);
  };

  return (
    <div
      className={`app${hasContent ? ' app--studio' : ''}`}
      onDragEnter={onDragEnter}
      onDragOver={onDragOver}
      onDragLeave={onDragLeave}
      onDrop={onDrop}
    >
      <a className="skip-link" href="#main">
        {t('app.skip')}
      </a>

      <Header
        theme={theme}
        errors={summary.errors}
        warnings={summary.warnings}
        canInstall={canInstall}
        onToggleTheme={onToggleTheme}
        onToggleLanguage={onToggleLanguage}
        onHelp={() => setDialog('help')}
        onInstall={() => void install()}
      />

      <main id="main" className="main">
        {hasContent ? (
          <>
            <Toolbar
              fileName={project.fileName}
              cueCount={project.cues.length}
              format={project.format}
              canUndo={project.canUndo}
              canRedo={project.canRedo}
              onImport={() => subtitleInputRef.current?.click()}
              onPaste={() => setDialog('paste')}
              onExport={() => setDialog('export')}
              onFix={() => setDialog('fix')}
              onTiming={() => setDialog('timing')}
              onUndo={project.undo}
              onRedo={project.redo}
            />

            <div className="studio">
              <div className="studio__column">
                <VideoPanel
                  video={video}
                  activeCue={activeCue}
                  hasCues={project.cues.length > 0}
                  onChoose={() => videoInputRef.current?.click()}
                  onRemove={removeVideo}
                />
              </div>

              <div className="studio__column studio__column--wide">
                <CueList
                  cues={project.cues}
                  format={project.format}
                  issues={issues}
                  activeId={activeCue?.id ?? null}
                  selectedId={selectedId}
                  autoFocusId={autoFocusId}
                  autoScroll={autoScroll}
                  playing={video.playing}
                  hasVideo={video.hasVideo}
                  onToggleAutoScroll={() => setAutoScroll((current) => !current)}
                  onSelect={setSelectedId}
                  onUpdateText={project.updateText}
                  onUpdateTiming={project.updateTiming}
                  onSeek={(id) => {
                    const cue = project.cues.find((item) => item.id === id);
                    if (cue) video.seek(cue.start);
                  }}
                  onSplit={(id) => {
                    if (!project.splitCue(id)) notify(t('cues.splitFailed'), 'error');
                  }}
                  onMerge={(id) => {
                    project.mergeCue(id);
                  }}
                  onDuplicate={project.duplicateCue}
                  onDelete={deleteCue}
                  onAdd={addCue}
                  onSort={sortCues}
                />
              </div>

              <div className="studio__column">
                <Inspector
                  issues={issues}
                  cues={project.cues}
                  summary={summary}
                  fixReport={project.fixReport}
                  onFocusCue={focusCue}
                  onDismissFix={project.dismissFixReport}
                />
              </div>
            </div>
          </>
        ) : (
          <EmptyState
            onChoose={() => subtitleInputRef.current?.click()}
            onPaste={() => setDialog('paste')}
            onSample={loadSample}
          />
        )}
      </main>

      <Footer />

      <input
        ref={subtitleInputRef}
        type="file"
        accept=".srt,.vtt,.json,text/vtt,application/json,text/plain"
        hidden
        onChange={(event) => {
          const file = event.target.files?.[0];
          event.target.value = '';
          if (file) void importFile(file);
        }}
      />
      <input
        ref={videoInputRef}
        type="file"
        accept="video/*,.mkv"
        hidden
        onChange={(event) => {
          const file = event.target.files?.[0];
          event.target.value = '';
          if (file) loadVideoFile(file);
        }}
      />

      {dragging ? (
        <div className="drop-overlay" aria-hidden="true">
          <div className="drop-overlay__card">
            <span className="drop-overlay__icon">
              <Icon name="upload" size={30} />
            </span>
            <strong>{t('empty.dropTitle')}</strong>
            <span>{t('empty.dropHint')}</span>
          </div>
        </div>
      ) : null}

      {dialog === 'export' ? (
        <ExportDialog
          cues={project.cues}
          format={project.format}
          fileName={project.fileName}
          issueCount={issues.length}
          onClose={() => setDialog(null)}
        />
      ) : null}

      {dialog === 'paste' ? (
        <PasteDialog
          onImport={(text) => importText(text, '', true)}
          onClose={() => setDialog(null)}
        />
      ) : null}

      {dialog === 'fix' ? (
        <FixDialog cues={project.cues} onApply={applyFix} onClose={() => setDialog(null)} />
      ) : null}

      {dialog === 'timing' ? (
        <TimingDialog
          cueCount={project.cues.length}
          onShift={shiftAll}
          onScale={scaleAll}
          onSort={sortCues}
          onClose={() => setDialog(null)}
        />
      ) : null}

      {dialog === 'help' ? <HelpDialog onClose={() => setDialog(null)} /> : null}
    </div>
  );
}

export default function App() {
  const [initial] = useState(() => loadStoredState());
  const [lang, setLang] = useState<Language>(initial?.lang ?? 'fa');
  const [theme, setTheme] = useState<Theme>(initial?.theme ?? 'dark');

  return (
    <I18nProvider lang={lang}>
      <ToastProvider>
        <Studio
          initial={initial}
          lang={lang}
          theme={theme}
          onToggleLanguage={() => setLang((current) => (current === 'fa' ? 'en' : 'fa'))}
          onToggleTheme={() => setTheme((current) => (current === 'dark' ? 'light' : 'dark'))}
        />
      </ToastProvider>
    </I18nProvider>
  );
}
