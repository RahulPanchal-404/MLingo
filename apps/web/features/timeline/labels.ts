/**
 * One vocabulary for training timelines (QA-11).
 * A run with N updates has N + 1 snapshots: snapshot 0 is the starting state, snapshot k is after update k.
 */
export const snapshotLabel = (update: number): string => (update <= 0 ? "Start (before any update)" : `After update ${update}`);

export const snapshotsSummary = (snapshots: number): string =>
  snapshots <= 0 ? "No snapshots" : `${snapshots} snapshots: start + ${snapshots - 1} updates`;
