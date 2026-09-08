export type TimelineMarkerType = "user" | "event";

export type TimelineMarker = {
      id: string;
      step: number;
      title: string;
      description?: string;
      type: TimelineMarkerType;
};