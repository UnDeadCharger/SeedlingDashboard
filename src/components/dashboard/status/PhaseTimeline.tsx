/**
 * Horizontal phase progress bar: Germination → Nursery → Complete.
 * Completed steps show a check mark and a green connecting line.
 * The active step glows green.
 *
 * Props:
 *   phase – "germination" | "nursery" | "done"
 *
 * Usage:
 *   <PhaseTimeline phase={data.phase} />
 */
import { PHASE_STEPS } from "../../../constants/phaseSteps";

type PhaseTimelineProps = {
  phase: "germination" | "nursery" | "done";
};

export function PhaseTimeline({ phase }: PhaseTimelineProps) {
  const phaseIdx = PHASE_STEPS.findIndex((p) => p.key === phase);

  return (
    <div className="phase-bar">
      {PHASE_STEPS.map((step, i) => {
        const done = i < phaseIdx;
        const active = i === phaseIdx;

        return (
          <div key={step.key} className={`phase-step${done ? " line-done" : ""}`}>
            <div className={`pdot ${done ? "pdot-done" : active ? "pdot-active" : "pdot-pending"}`}>
              {done ? "✓" : step.icon}
            </div>
            <span
              className={`plabel ${done ? "plabel-done" : active ? "plabel-active" : "plabel-pending"}`}
            >
              {step.label}
            </span>
          </div>
        );
      })}
    </div>
  );
}
