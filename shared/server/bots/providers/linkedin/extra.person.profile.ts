export function extractConnectionTarget(payload: any) {
  // 1) Resolve the target profile URN from the query result
  const elements =
    payload?.data?.data?.identityDashProfilesByMemberIdentity?.['*elements'] ||
    payload?.data?.identityDashProfilesByMemberIdentity?.['*elements'] ||
    [];

  const targetProfileUrn = Array.isArray(elements) ? elements[0] : null; // e.g. "urn:li:fsd_profile:ACoAAC3X..."
  const included = Array.isArray(payload?.included) ? payload.included : [];

  // quick helpers
  const endsWithType = (obj: any, suffix: any) =>
    typeof obj?.$type === 'string' && obj.$type.endsWith(suffix);

  // 2) Find the target profile object in `included`
  const profile = included.find(
    (it) =>
      endsWithType(it, '.identity.profile.Profile') &&
      it.entityUrn === targetProfileUrn,
  );

  // 3) Pull first/last name
  const firstName = profile?.firstName ?? null;
  const lastName = profile?.lastName ?? null;

  const degree = JSON.stringify(payload).match(/DISTANCE_(\d)/g);
  const pending = JSON.stringify(payload).match(/PENDING/g);
  return {
    firstName,
    lastName,
    degree: degree ? parseInt(degree[0].replace('DISTANCE_', '')) : 1,
    pending: !!pending,
  };
}
