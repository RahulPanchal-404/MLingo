import { redirect } from "next/navigation";

type Props = { params: Promise<{ slug: string }> };

/** The code for each topic moved to the Code track. */
export default async function OldTopicCodePage({ params }: Props) {
  const { slug } = await params;
  redirect(`/code/${slug}`);
}
