import type { PlaybackSpeed } from "@/features/timeline/use-training-timeline";
import type { TimelineMarker } from "@/features/timeline/types";

type TimelineControlsProps = {
  currentStep: number;
  totalSteps: number;
  isPlaying: boolean;
  reducedMotion: boolean;
  playbackSpeed: PlaybackSpeed;
  markers: TimelineMarker[];
  onPlayToggle: () => void;
  onReset: () => void;
  onForward: () => void;
  onBackward: () => void;
  onJump: (step: number) => void;
  onSpeed: (speed: PlaybackSpeed) => void;
  onAddMarker: () => void;
  onRemoveMarker: (id: string) => void;
};

export function TimelineControls(props: TimelineControlsProps) {
  const { currentStep, totalSteps, isPlaying, reducedMotion, playbackSpeed, markers, onPlayToggle, onReset, onForward, onBackward, onJump, onSpeed, onAddMarker, onRemoveMarker } = props;
  const hasHistory = totalSteps > 0;
  const finalStep = Math.max(totalSteps - 1, 0);
  const rulerSteps = getRulerSteps(totalSteps);

  return (
    <section aria-label="Training timeline" className="timeline-panel">
      <div className="timeline-heading">
        <div>
          <p className="eyebrow">Training timeline</p>
          <h2>{hasHistory ? `Frame ${currentStep + 1} / ${totalSteps}` : "No frames recorded"}</h2>
        </div>
        <label className="speed-control">
          <span>Playback</span>
          <select aria-label="Playback speed" onChange={(event) => onSpeed(Number(event.target.value) as PlaybackSpeed)} value={playbackSpeed}>
            <option value="0.5">0.5x</option>
            <option value="1">1x</option>
            <option value="2">2x</option>
          </select>
        </label>
      </div>
      <div className="timeline-ruler" aria-label="Training timeline ruler">
        <div className="ruler-track" aria-hidden="true" />
        <input aria-label="Timeline playhead" disabled={!hasHistory} max={finalStep} min="0" onChange={(event) => onJump(Number(event.target.value))} type="range" value={Math.min(currentStep, finalStep)} />
        <div className="ruler-ticks" aria-hidden="true">{rulerSteps.map((step) => <span key={step} style={{ left: `${getPosition(step, finalStep)}%` }} />)}</div>
        <div className="timeline-markers" aria-label="Timeline markers">{markers.map((marker) => <MarkerButton key={marker.id} marker={marker} finalStep={finalStep} onJump={onJump} onRemove={onRemoveMarker} />)}</div>
        <div className="timeline-playhead" aria-hidden="true" style={{ left: `${getPosition(currentStep, finalStep)}%` }} />
      </div>
      <div className="timeline-labels">{rulerSteps.map((step) => <span key={step} style={{ left: `${getPosition(step, finalStep)}%` }}>Step {step + 1}</span>)}</div>
      <div className="timeline-current">Selected frame <strong>{hasHistory ? currentStep + 1 : "-"}</strong> of {totalSteps || "-"}</div>
      <div className="timeline-actions">
        <button aria-label="Step backward" disabled={!hasHistory || currentStep === 0} onClick={onBackward} type="button">Previous</button>
        <button aria-label={isPlaying ? "Pause playback" : "Play training"} className="primary-button" disabled={!hasHistory || reducedMotion || currentStep === finalStep} onClick={onPlayToggle} type="button">{isPlaying ? "Pause" : "Play"}</button>
        <button aria-label="Step forward" disabled={!hasHistory || currentStep >= finalStep} onClick={onForward} type="button">Next</button>
        <button aria-label="Reset timeline" disabled={!hasHistory} onClick={onReset} type="button">Reset</button>
        <button aria-label="Add marker at selected frame" disabled={!hasHistory} onClick={onAddMarker} type="button">+ Add marker</button>
      </div>
      {reducedMotion && <p className="motion-note">Playback is paused because reduced motion is enabled. Scrubbing and stepping remain available.</p>}
    </section>
  );
}

function getRulerSteps(totalSteps: number): number[] {
  if (totalSteps <= 0) return [];
  if (totalSteps === 1) return [0];
  const count = Math.min(6, totalSteps);
  return Array.from({ length: count }, (_, index) => Math.round(index * (totalSteps - 1) / (count - 1)));
}

function getPosition(step: number, finalStep: number): number {
  return finalStep > 0 ? (step / finalStep) * 100 : 0;
}

function MarkerButton({ marker, finalStep, onJump, onRemove }: { marker: TimelineMarker; finalStep: number; onJump: (step: number) => void; onRemove: (id: string) => void }) {
  return <div className={`timeline-marker ${marker.type}`} style={{ left: `${getPosition(marker.step, finalStep)}%` }}><button aria-label={`${marker.title}, step ${marker.step + 1}`} className="marker-pin" onClick={() => onJump(marker.step)} title={marker.description ?? marker.title} type="button"><span className="sr-only">{marker.title}</span></button>{marker.type === "user" && <button aria-label={`Remove marker ${marker.title}`} className="marker-remove" onClick={() => onRemove(marker.id)} type="button">x</button>}</div>;
}
