import { useReducer } from 'react';
import {
  createCueAfter,
  duplicateCue as duplicateCueCore,
  mergeCues,
  replaceCue,
  scaleAll as scaleCues,
  shiftAll as shiftCues,
  sortCues,
  splitCue as splitCueCore,
} from '../core/operations';
import { fixCues } from '../core/persian';
import type { Cue, FixReport, PersianFixOptions, SubtitleFormat } from '../core/types';

export interface ProjectSeed {
  cues: Cue[];
  format: SubtitleFormat;
  fileName: string | null;
}

interface Snapshot {
  cues: Cue[];
  format: SubtitleFormat;
  fileName: string | null;
}

interface State extends Snapshot {
  past: Snapshot[];
  future: Snapshot[];
  lastKey: string | null;
  lastAt: number;
  fixReport: FixReport | null;
}

type Action =
  | {
      type: 'commit';
      cues: Cue[];
      format?: SubtitleFormat;
      fileName?: string | null;
      key?: string;
      at: number;
      report?: FixReport | null;
    }
  | { type: 'undo' }
  | { type: 'redo' }
  | { type: 'report'; report: FixReport | null };

const HISTORY_LIMIT = 80;
const COALESCE_MS = 800;

function snapshot(state: State): Snapshot {
  return { cues: state.cues, format: state.format, fileName: state.fileName };
}

function reducer(state: State, action: Action): State {
  switch (action.type) {
    case 'commit': {
      const coalesce =
        action.key != null &&
        state.lastKey === action.key &&
        action.at - state.lastAt < COALESCE_MS;
      const past = coalesce
        ? state.past
        : [...state.past, snapshot(state)].slice(-HISTORY_LIMIT);
      return {
        ...state,
        cues: action.cues,
        format: action.format ?? state.format,
        fileName: action.fileName !== undefined ? action.fileName : state.fileName,
        past,
        future: [],
        lastKey: action.key ?? null,
        lastAt: action.at,
        fixReport: action.report !== undefined ? action.report : state.fixReport,
      };
    }
    case 'undo': {
      const previous = state.past[state.past.length - 1];
      if (!previous) return state;
      return {
        ...state,
        ...previous,
        past: state.past.slice(0, -1),
        future: [snapshot(state), ...state.future].slice(0, HISTORY_LIMIT),
        lastKey: null,
        lastAt: 0,
        fixReport: null,
      };
    }
    case 'redo': {
      const next = state.future[0];
      if (!next) return state;
      return {
        ...state,
        ...next,
        past: [...state.past, snapshot(state)].slice(-HISTORY_LIMIT),
        future: state.future.slice(1),
        lastKey: null,
        lastAt: 0,
        fixReport: null,
      };
    }
    case 'report':
      return { ...state, fixReport: action.report };
  }
}

export function useProject(seed: ProjectSeed) {
  const [state, dispatch] = useReducer(reducer, seed, (initial): State => ({
    ...initial,
    past: [],
    future: [],
    lastKey: null,
    lastAt: 0,
    fixReport: null,
  }));

  const commit = (
    cues: Cue[],
    options: {
      format?: SubtitleFormat;
      fileName?: string | null;
      key?: string;
      report?: FixReport | null;
    } = {},
  ) => {
    dispatch({ type: 'commit', cues, at: Date.now(), ...options });
  };

  const loadProject = (cues: Cue[], format: SubtitleFormat, fileName: string | null) => {
    commit(cues, { format, fileName, report: null });
  };

  const updateText = (id: string, text: string) => {
    const cue = state.cues.find((item) => item.id === id);
    if (!cue || cue.text === text) return;
    commit(replaceCue(state.cues, id, { text }), { key: `text:${id}` });
  };

  const updateTiming = (id: string, field: 'start' | 'end', value: number) => {
    const cue = state.cues.find((item) => item.id === id);
    const nextValue = Math.max(0, Math.round(value));
    if (!cue || cue[field] === nextValue) return;
    commit(replaceCue(state.cues, id, { [field]: nextValue }), { key: `${field}:${id}` });
  };

  const addCue = (afterId?: string | null): Cue => {
    const cue = createCueAfter(state.cues, afterId);
    const anchorIndex = afterId
      ? state.cues.findIndex((item) => item.id === afterId)
      : state.cues.length - 1;
    const insertAt = (anchorIndex >= 0 ? anchorIndex : state.cues.length - 1) + 1;
    const next = [...state.cues];
    next.splice(insertAt, 0, cue);
    commit(next);
    return cue;
  };

  const removeCue = (id: string) => {
    commit(state.cues.filter((cue) => cue.id !== id));
  };

  const duplicateCue = (id: string) => {
    const index = state.cues.findIndex((cue) => cue.id === id);
    if (index === -1) return;
    const copy = duplicateCueCore(state.cues[index]);
    const next = [...state.cues];
    next.splice(index + 1, 0, copy);
    commit(next);
  };

  const splitCue = (id: string): boolean => {
    const index = state.cues.findIndex((cue) => cue.id === id);
    if (index === -1) return false;
    const parts = splitCueCore(state.cues[index]);
    if (!parts) return false;
    const next = [...state.cues];
    next.splice(index, 1, ...parts);
    commit(next);
    return true;
  };

  const mergeCue = (id: string): boolean => {
    const index = state.cues.findIndex((cue) => cue.id === id);
    if (index === -1 || index === state.cues.length - 1) return false;
    const merged = mergeCues(state.cues[index], state.cues[index + 1]);
    const next = [...state.cues];
    next.splice(index, 2, merged);
    commit(next);
    return true;
  };

  const sortByTime = (): boolean => {
    const sorted = sortCues(state.cues);
    const unchanged = sorted.every((cue, index) => cue.id === state.cues[index]?.id);
    if (unchanged) return false;
    commit(sorted);
    return true;
  };

  const shiftAll = (ms: number) => {
    commit(shiftCues(state.cues, ms));
  };

  const scaleAll = (percent: number) => {
    commit(scaleCues(state.cues, percent / 100));
  };

  const applyFix = (options: PersianFixOptions): number => {
    const result = fixCues(state.cues, options);
    if (result.report.changed.length > 0) {
      commit(result.cues, { report: result.report });
    } else {
      dispatch({ type: 'report', report: result.report });
    }
    return result.report.changed.length;
  };

  const dismissFixReport = () => dispatch({ type: 'report', report: null });

  const setFormat = (format: SubtitleFormat) => {
    if (format === state.format) return;
    commit(state.cues, { format });
  };

  return {
    cues: state.cues,
    format: state.format,
    fileName: state.fileName,
    fixReport: state.fixReport,
    canUndo: state.past.length > 0,
    canRedo: state.future.length > 0,
    loadProject,
    setFormat,
    updateText,
    updateTiming,
    addCue,
    removeCue,
    duplicateCue,
    splitCue,
    mergeCue,
    sortByTime,
    shiftAll,
    scaleAll,
    applyFix,
    dismissFixReport,
    undo: () => dispatch({ type: 'undo' }),
    redo: () => dispatch({ type: 'redo' }),
  };
}

export type ProjectController = ReturnType<typeof useProject>;
