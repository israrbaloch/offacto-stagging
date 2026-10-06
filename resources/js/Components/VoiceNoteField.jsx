import { useCallback, useEffect, useRef, useState } from 'react';
import { t } from '../lib/i18n';
import { useDragDropFile } from '../lib/useDragDropFile';

const MAX_BYTES = 5 * 1024 * 1024;
const ACCEPT = 'audio/mpeg,audio/mp3,audio/wav,audio/webm,audio/ogg,audio/x-m4a,audio/mp4';
const BAR_COUNT = 36;

function formatBytes(bytes) {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

function formatDuration(totalSeconds) {
    const s = Math.max(0, Math.floor(totalSeconds));
    const m = Math.floor(s / 60);
    const r = s % 60;
    return `${m}:${String(r).padStart(2, '0')}`;
}

function IconMic({ className }) {
    return (
        <svg className={className} viewBox="0 0 24 24" fill="currentColor" aria-hidden>
            <path d="M12 14a3 3 0 0 0 3-3V5a3 3 0 1 0-6 0v6a3 3 0 0 0 3 3Zm5-3a5 5 0 0 1-10 0H5a7 7 0 0 0 6 6.71V21h2v-3.29A7 7 0 0 0 19 11h-2Z" />
        </svg>
    );
}

function IconTrash({ className }) {
    return (
        <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden>
            <path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
        </svg>
    );
}

function IconPlay({ className }) {
    return (
        <svg className={className} viewBox="0 0 24 24" fill="currentColor" aria-hidden>
            <path d="M8 5v14l11-7L8 5Z" />
        </svg>
    );
}

function IconPause({ className }) {
    return (
        <svg className={className} viewBox="0 0 24 24" fill="currentColor" aria-hidden>
            <path d="M6 5h4v14H6V5Zm8 0h4v14h-4V5Z" />
        </svg>
    );
}

function WaveformBars({ progress = 0, active = false, seed = 0 }) {
    const heights = useRef(null);
    if (!heights.current) {
        heights.current = Array.from({ length: BAR_COUNT }, (_, i) => {
            const n = Math.sin(i * 0.7 + seed) * 0.5 + Math.cos(i * 0.3) * 0.3;
            return 0.25 + (Math.abs(n) % 1) * 0.75;
        });
    }

    const filledThrough = Math.floor(progress * BAR_COUNT);

    return (
        <div className="flex h-8 flex-1 items-center gap-[2px]" aria-hidden>
            {heights.current.map((h, i) => {
                const filled = active || i < filledThrough;
                return (
                    <span
                        key={i}
                        className={`w-[3px] shrink-0 rounded-full transition-colors ${filled ? 'bg-emerald-600' : 'bg-slate-300'}`}
                        style={{
                            height: `${Math.round(h * 100)}%`,
                            opacity: active ? 0.85 + (i % 3) * 0.05 : 1,
                        }}
                    />
                );
            })}
        </div>
    );
}

function VoicePlaybackBubble({ previewUrl, fileName, fileSize, onDelete }) {
    const audioRef = useRef(null);
    const [playing, setPlaying] = useState(false);
    const [progress, setProgress] = useState(0);
    const [duration, setDuration] = useState(0);

    useEffect(() => {
        const audio = audioRef.current;
        if (!audio) return;

        const onTime = () => {
            if (audio.duration && Number.isFinite(audio.duration)) {
                setProgress(audio.currentTime / audio.duration);
                setDuration(audio.duration);
            }
        };
        const onMeta = () => {
            if (audio.duration && Number.isFinite(audio.duration)) {
                setDuration(audio.duration);
            }
        };
        const onEnd = () => {
            setPlaying(false);
            setProgress(0);
            audio.currentTime = 0;
        };

        audio.addEventListener('timeupdate', onTime);
        audio.addEventListener('loadedmetadata', onMeta);
        audio.addEventListener('ended', onEnd);
        return () => {
            audio.removeEventListener('timeupdate', onTime);
            audio.removeEventListener('loadedmetadata', onMeta);
            audio.removeEventListener('ended', onEnd);
        };
    }, [previewUrl]);

    const togglePlay = () => {
        const audio = audioRef.current;
        if (!audio) return;
        if (playing) {
            audio.pause();
            setPlaying(false);
        } else {
            audio.play().then(() => setPlaying(true)).catch(() => {});
        }
    };

    const displayTime = playing || progress > 0
        ? formatDuration((duration || 0) * progress)
        : formatDuration(duration || 0);

    return (
        <div className="flex items-center gap-2 rounded-2xl border border-slate-200 bg-[#f0f2f5] px-3 py-2.5">
            <audio ref={audioRef} src={previewUrl} preload="metadata" className="hidden" />
            <button
                type="button"
                onClick={togglePlay}
                className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-emerald-600 text-white shadow-sm hover:bg-emerald-500"
                aria-label={playing ? t('offers.voice_pause') : t('offers.voice_play')}
            >
                {playing ? <IconPause className="h-5 w-5" /> : <IconPlay className="h-5 w-5 pl-0.5" />}
            </button>
            <WaveformBars progress={progress} seed={fileName?.length || 1} />
            <span className="min-w-[2.5rem] text-xs tabular-nums text-slate-600">{displayTime}</span>
            <button
                type="button"
                onClick={onDelete}
                className="rounded-full p-2 text-slate-500 hover:bg-slate-200/80 hover:text-rose-600"
                aria-label={t('common.delete')}
            >
                <IconTrash className="h-5 w-5" />
            </button>
            <span className="sr-only">
                {fileName} · {formatBytes(fileSize)}
            </span>
        </div>
    );
}

function modeTabClass(active, nested) {
    if (nested) {
        return active
            ? 'rounded-md bg-white px-3 py-1.5 text-xs font-semibold text-slate-900 shadow-sm'
            : 'rounded-md px-3 py-1.5 text-xs font-medium text-slate-600 hover:text-slate-900';
    }
    return `rounded-full px-3 py-1.5 text-xs font-medium ${active ? 'bg-slate-900 text-white' : 'bg-slate-100 text-slate-600'}`;
}

function ModeTabs({ nested, children }) {
    if (nested) {
        return (
            <div className="border-l-2 border-slate-300 pl-4">
                <p className="text-xs font-medium text-slate-500">{t('offers.accept_method')}</p>
                <div className="mt-2 inline-flex gap-0.5 rounded-lg bg-slate-200/80 p-0.5" role="tablist">
                    {children}
                </div>
            </div>
        );
    }
    return (
        <div className="flex gap-2" role="tablist">
            {children}
        </div>
    );
}

export default function VoiceNoteField({ value, onChange, error, nested = false }) {
    const [mode, setMode] = useState('record');
    const [recording, setRecording] = useState(false);
    const [recordSeconds, setRecordSeconds] = useState(0);
    const [localError, setLocalError] = useState('');
    const [previewUrl, setPreviewUrl] = useState(null);
    const [liveLevels, setLiveLevels] = useState(() => Array(BAR_COUNT).fill(0.2));

    const mediaRecorder = useRef(null);
    const chunks = useRef([]);
    const timer = useRef(null);
    const fileInput = useRef(null);
    const discardRecording = useRef(false);
    const streamRef = useRef(null);
    const audioContextRef = useRef(null);
    const analyserRef = useRef(null);
    const levelLoopRef = useRef(null);

    useEffect(() => {
        return () => {
            if (previewUrl) URL.revokeObjectURL(previewUrl);
            cleanupAudioGraph();
        };
    }, [previewUrl]);

    const cleanupAudioGraph = useCallback(() => {
        if (levelLoopRef.current) {
            cancelAnimationFrame(levelLoopRef.current);
            levelLoopRef.current = null;
        }
        analyserRef.current = null;
        if (audioContextRef.current) {
            audioContextRef.current.close().catch(() => {});
            audioContextRef.current = null;
        }
        if (streamRef.current) {
            streamRef.current.getTracks().forEach((track) => track.stop());
            streamRef.current = null;
        }
    }, []);

    const startLevelMeter = useCallback((stream) => {
        const AudioCtx = window.AudioContext || window.webkitAudioContext;
        if (!AudioCtx) return;

        const ctx = new AudioCtx();
        const source = ctx.createMediaStreamSource(stream);
        const analyser = ctx.createAnalyser();
        analyser.fftSize = 64;
        analyser.smoothingTimeConstant = 0.75;
        source.connect(analyser);

        audioContextRef.current = ctx;
        analyserRef.current = analyser;

        const data = new Uint8Array(analyser.frequencyBinCount);

        const tick = () => {
            analyser.getByteFrequencyData(data);
            const step = Math.max(1, Math.floor(data.length / BAR_COUNT));
            const next = Array.from({ length: BAR_COUNT }, (_, i) => {
                const v = data[i * step] / 255;
                return 0.15 + v * 0.85;
            });
            setLiveLevels(next);
            levelLoopRef.current = requestAnimationFrame(tick);
        };
        tick();
    }, []);

    const setFile = (file) => {
        setLocalError('');
        if (!file) {
            onChange(null);
            setPreviewUrl(null);
            return;
        }
        if (file.size > MAX_BYTES) {
            setLocalError(t('offers.voice_too_large', { max: '5 MB' }));
            onChange(null);
            return;
        }
        if (!file.type.startsWith('audio/') && !ACCEPT.split(',').some((m) => file.type === m)) {
            setLocalError(t('offers.voice_type_invalid'));
            onChange(null);
            return;
        }
        if (previewUrl) URL.revokeObjectURL(previewUrl);
        setPreviewUrl(URL.createObjectURL(file));
        onChange(file);
    };

    const startRecording = async () => {
        setLocalError('');
        discardRecording.current = false;
        try {
            const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
            streamRef.current = stream;
            startLevelMeter(stream);

            const recorder = new MediaRecorder(stream);
            chunks.current = [];
            recorder.ondataavailable = (e) => {
                if (e.data.size > 0) chunks.current.push(e.data);
            };
            recorder.onstop = () => {
                cleanupAudioGraph();
                if (discardRecording.current) {
                    discardRecording.current = false;
                    chunks.current = [];
                    return;
                }
                const blob = new Blob(chunks.current, { type: recorder.mimeType || 'audio/webm' });
                if (blob.size > MAX_BYTES) {
                    setLocalError(t('offers.voice_too_large', { max: '5 MB' }));
                    return;
                }
                const file = new File([blob], `voice-note-${Date.now()}.webm`, { type: blob.type });
                setFile(file);
            };
            mediaRecorder.current = recorder;
            recorder.start(200);
            setRecording(true);
            setRecordSeconds(0);
            timer.current = setInterval(() => setRecordSeconds((s) => s + 1), 1000);
        } catch {
            cleanupAudioGraph();
            setLocalError(t('offers.voice_mic_denied'));
        }
    };

    const stopRecording = () => {
        mediaRecorder.current?.stop();
        setRecording(false);
        if (timer.current) clearInterval(timer.current);
        setLiveLevels(Array(BAR_COUNT).fill(0.2));
    };

    const cancelRecording = () => {
        discardRecording.current = true;
        mediaRecorder.current?.stop();
        setRecording(false);
        if (timer.current) clearInterval(timer.current);
        setRecordSeconds(0);
        setLiveLevels(Array(BAR_COUNT).fill(0.2));
    };

    const clear = () => {
        setFile(null);
        if (fileInput.current) fileInput.current.value = '';
    };

    const { dragOver, dropzoneProps } = useDragDropFile((file) => {
        setFile(file);
        if (fileInput.current) {
            fileInput.current.value = '';
        }
    });

    const displayError = error || localError;

    return (
        <div className="space-y-3">
            <ModeTabs nested={nested}>
                <button
                    type="button"
                    role="tab"
                    aria-selected={mode === 'upload'}
                    onClick={() => setMode('upload')}
                    className={modeTabClass(mode === 'upload', nested)}
                >
                    {t('offers.voice_upload')}
                </button>
                <button
                    type="button"
                    role="tab"
                    aria-selected={mode === 'record'}
                    onClick={() => setMode('record')}
                    className={modeTabClass(mode === 'record', nested)}
                >
                    {t('offers.voice_record')}
                </button>
            </ModeTabs>

            {mode === 'upload' && (
                <div
                    {...dropzoneProps}
                    role="button"
                    tabIndex={0}
                    onClick={() => fileInput.current?.click()}
                    onKeyDown={(event) => {
                        if (event.key === 'Enter' || event.key === ' ') {
                            event.preventDefault();
                            fileInput.current?.click();
                        }
                    }}
                    className={`flex cursor-pointer flex-col items-center justify-center rounded-xl border-2 border-dashed px-4 py-6 text-center transition-colors ${
                        dragOver
                            ? 'border-emerald-500 bg-emerald-50'
                            : 'border-slate-200 bg-slate-50 hover:border-emerald-200 hover:bg-emerald-50/30'
                    }`}
                >
                    <IconMic className={`mb-2 h-8 w-8 ${dragOver ? 'text-emerald-600' : 'text-slate-400'}`} />
                    <span className="text-sm font-medium text-slate-700">{t('offers.voice_drop_hint')}</span>
                    <span className="mt-1 text-xs text-slate-500">{t('offers.voice_limits')}</span>
                    <input
                        ref={fileInput}
                        type="file"
                        accept={ACCEPT}
                        className="sr-only"
                        onChange={(e) => setFile(e.target.files?.[0] || null)}
                    />
                </div>
            )}

            {mode === 'record' && (
                <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white">
                    {value && previewUrl && !recording ? (
                        <div className="p-3">
                            <VoicePlaybackBubble
                                previewUrl={previewUrl}
                                fileName={value.name}
                                fileSize={value.size}
                                onDelete={clear}
                            />
                            <p className="mt-2 text-center text-xs text-slate-500">{t('offers.voice_tap_to_rerecord')}</p>
                            <div className="mt-3 flex justify-center">
                                <button
                                    type="button"
                                    onClick={clear}
                                    className="flex h-14 w-14 items-center justify-center rounded-full bg-emerald-600 text-white shadow-md hover:bg-emerald-500"
                                    aria-label={t('offers.voice_start')}
                                >
                                    <IconMic className="h-7 w-7" />
                                </button>
                            </div>
                        </div>
                    ) : recording ? (
                        <div className="flex items-center gap-2 px-3 py-3">
                            <button
                                type="button"
                                onClick={cancelRecording}
                                className="shrink-0 rounded-full p-2 text-slate-500 hover:bg-slate-100 hover:text-rose-600"
                                aria-label={t('offers.voice_cancel_recording')}
                            >
                                <IconTrash className="h-6 w-6" />
                            </button>
                            <span className="inline-flex h-2.5 w-2.5 shrink-0 animate-pulse rounded-full bg-rose-500" />
                            <span className="shrink-0 text-sm font-medium tabular-nums text-slate-800">
                                {formatDuration(recordSeconds)}
                            </span>
                            <div className="flex h-9 flex-1 items-center gap-[2px] px-1">
                                {liveLevels.map((h, i) => (
                                    <span
                                        key={i}
                                        className="w-[3px] shrink-0 rounded-full bg-emerald-600/90"
                                        style={{ height: `${Math.round(h * 100)}%` }}
                                    />
                                ))}
                            </div>
                            <button
                                type="button"
                                onClick={stopRecording}
                                className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-emerald-600 text-white shadow-sm hover:bg-emerald-500"
                                aria-label={t('offers.voice_stop')}
                            >
                                <span className="block h-4 w-4 rounded-sm bg-white" />
                            </button>
                        </div>
                    ) : (
                        <div className="flex flex-col items-center px-4 py-8">
                            <p className="mb-4 text-sm text-slate-500">{t('offers.voice_tap_to_record')}</p>
                            <button
                                type="button"
                                onClick={startRecording}
                                className="flex h-16 w-16 items-center justify-center rounded-full bg-emerald-600 text-white shadow-lg ring-4 ring-emerald-600/20 transition hover:scale-105 hover:bg-emerald-500 active:scale-95"
                                aria-label={t('offers.voice_start')}
                            >
                                <IconMic className="h-8 w-8" />
                            </button>
                        </div>
                    )}
                </div>
            )}

            {mode === 'upload' && value && previewUrl && (
                <VoicePlaybackBubble
                    previewUrl={previewUrl}
                    fileName={value.name}
                    fileSize={value.size}
                    onDelete={clear}
                />
            )}

            {displayError && <p className="text-xs text-rose-600">{displayError}</p>}
        </div>
    );
}
