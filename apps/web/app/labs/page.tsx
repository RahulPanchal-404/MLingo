import { SectionPage } from "@/components/layout/section-page";
import Link from "next/link";

export default function LabsPage() {
  return <SectionPage title="ML Labs" description="Explore hands-on machine learning concepts through recorded training runs."><Link className="primary-button" href="/labs/gradient-descent">Open Gradient Descent Lab</Link></SectionPage>;
}
