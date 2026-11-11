import type { Deep } from "./types";
import { DEEP_FOUNDATIONS } from "./foundations";
import { DEEP_REGRESSION } from "./regression";
import { DEEP_CLASSIFICATION } from "./classification";
import { DEEP_UNSUPERVISED_NN } from "./unsupervised-nn";
import { DEEP_WORKFLOW } from "./workflow";
import { DEEP_PREREQS } from "./prereqs";

export const DEEP: Record<string, Deep> = {
  ...DEEP_FOUNDATIONS,
  ...DEEP_REGRESSION,
  ...DEEP_CLASSIFICATION,
  ...DEEP_UNSUPERVISED_NN,
  ...DEEP_WORKFLOW,
  ...DEEP_PREREQS,
};
