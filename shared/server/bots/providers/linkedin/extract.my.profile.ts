export function extractMyProfile(payload: any) {
  // 1) Normalize where the useful bits live
  const root = payload?.data?.data || payload?.data || payload;

  // 2) Find the profile object in the `included` array
  const included = payload?.included || root?.included || [];
  const profile =
    included.find(
      (x) =>
        x?.$type === 'com.linkedin.voyager.dash.identity.profile.Profile' ||
        x?.$type?.endsWith('.identity.profile.Profile'),
    ) || null;

  if (!profile) return false;

  // 3) Build a full name
  const first = (profile.firstName || '').trim();
  const last = (profile.lastName || '').trim();
  const name =
    [first, last].filter(Boolean).join(' ') || profile.publicIdentifier || null;

  // 4) Choose a stable "id"
  // Prefer the numeric member id from objectUrn (e.g., "urn:li:member:392634993"),
  // then publicIdentifier, then the profile entityUrn tail.
  const memberId =
    profile.objectUrn?.split(':').pop() ||
    profile.publicIdentifier ||
    profile.entityUrn?.split(':').pop() ||
    null;

  // 5) Get the highest-res profile photo URL if available
  function bestVectorUrl(vec) {
    if (!vec?.rootUrl || !Array.isArray(vec.artifacts)) return null;
    // pick the widest artifact
    const best = vec.artifacts
      .slice()
      .sort((a, b) => (b.width || 0) - (a.width || 0))[0];
    return best?.fileIdentifyingUrlPathSegment
      ? vec.rootUrl + best.fileIdentifyingUrlPathSegment
      : null;
  }

  const pp = profile.profilePicture || {};
  const displayVec = pp.displayImageReferenceResolutionResult?.vectorImage;
  const originalVec = pp.originalImageReferenceResolutionResult?.vectorImage;
  const profilePicture =
    bestVectorUrl(displayVec) || bestVectorUrl(originalVec) || null;

  return {
    id: memberId,
    name,
    picture: profilePicture,
  };
}