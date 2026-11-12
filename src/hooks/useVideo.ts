import { useCallback, useEffect, useRef, useState } from 'react';

const VIDEO_EXTENSION = /\.(mp4|webm|ogv|ogg|mov|m4v|mkv)$/i;

export function isVideoFile(file: File): boolean {
  return file.type.startsWith('video/') || VIDEO_EXTENSION.test(file.name);
}

export function useVideo(onError: () => void) {
  const [url, setUrl] = useState<string | null>(null);
  const [name, setName] = useState<string | null>(null);
  const [element, setElement] = useState<HTMLVideoElement | null>(null);
  const [currentTime, setCurrentTime] = useState(0);
  const [playing, setPlaying] = useState(false);
  const urlRef = useRef<string | null>(null);
  const errorRef = useRef(onError);

  useEffect(() => {
    errorRef.current = onError;
  }, [onError]);

  useEffect(() => {
    return () => {
      if (urlRef.current) URL.revokeObjectURL(urlRef.current);
    };
  }, []);

  const load = useCallback((file: File) => {
    if (!isVideoFile(file)) return;
    const nextUrl = URL.createObjectURL(file);
    if (urlRef.current) URL.revokeObjectURL(urlRef.current);
    urlRef.current = nextUrl;
    setUrl(nextUrl);
    setName(file.name);
    setCurrentTime(0);
    setPlaying(false);
  }, []);

  const remove = useCallback(() => {
    if (urlRef.current) URL.revokeObjectURL(urlRef.current);
    urlRef.current = null;
    setUrl(null);
    setName(null);
    setCurrentTime(0);
    setPlaying(false);
  }, []);

  useEffect(() => {
    if (!element) return;

    const syncTime = () => setCurrentTime(element.currentTime * 1_000);
    const onPlay = () => setPlaying(true);
    const onPause = () => setPlaying(false);
    const onEnded = () => setPlaying(false);
    const onError = () => errorRef.current();

    element.addEventListener('timeupdate', syncTime);
    element.addEventListener('seeked', syncTime);
    element.addEventListener('loadedmetadata', syncTime);
    element.addEventListener('play', onPlay);
    element.addEventListener('pause', onPause);
    element.addEventListener('ended', onEnded);
    element.addEventListener('error', onError);

    return () => {
      element.removeEventListener('timeupdate', syncTime);
      element.removeEventListener('seeked', syncTime);
      element.removeEventListener('loadedmetadata', syncTime);
      element.removeEventListener('play', onPlay);
      element.removeEventListener('pause', onPause);
      element.removeEventListener('ended', onEnded);
      element.removeEventListener('error', onError);
    };
  }, [element]);

  useEffect(() => {
    if (!element || !playing) return;
    let frame = 0;
    const tick = () => {
      setCurrentTime(element.currentTime * 1_000);
      frame = requestAnimationFrame(tick);
    };
    frame = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(frame);
  }, [element, playing]);

  const seek = useCallback(
    (ms: number) => {
      if (!element || !Number.isFinite(ms)) return;
      const seconds = Math.max(0, ms / 1_000);
      element.currentTime = seconds;
      setCurrentTime(seconds * 1_000);
    },
    [element],
  );

  const toggle = useCallback(() => {
    if (!element) return;
    if (element.paused) {
      void element.play().catch(() => errorRef.current());
    } else {
      element.pause();
    }
  }, [element]);

  return {
    url,
    name,
    element,
    setElement,
    currentTime,
    playing,
    load,
    remove,
    seek,
    toggle,
    hasVideo: url !== null,
  };
}

export type VideoController = ReturnType<typeof useVideo>;
