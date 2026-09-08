import { notFound } from "next/navigation";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { ProfilePageContent } from "@/components/profile/ProfilePageContent";
import { reservedHandles } from "@/constants";
import { api } from "@/lib/api";
import { buildProfileFallbackMetadata, buildProfileMetadata } from "@/lib/profile-metadata";

type PageProps = {
  params: Promise<{ handle: string }>;
  searchParams: Promise<{ built?: string }>;
};

export async function generateMetadata({ params }: PageProps) {
  const { handle } = await params;
  try {
    const profile = await api.getProfile(handle);
    return buildProfileMetadata(profile);
  } catch {
    return buildProfileFallbackMetadata(handle);
  }
}

export default async function ProfilePage({ params, searchParams }: PageProps) {
  const { handle } = await params;
  const { built } = await searchParams;

  if (reservedHandles.has(handle.toLowerCase())) {
    notFound();
  }

  let initialProfile;
  try {
    initialProfile = await api.getProfile(handle);
  } catch {
    notFound();
  }

  return (
    <>
      <Navbar />
      <ProfilePageContent
        handle={handle}
        initialProfile={initialProfile}
        initialBuildPhase={built === "1" ? "building" : "revealed"}
      />
      <Footer />
    </>
  );
}
