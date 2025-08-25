/**
 * 0 → I don’t follow & he doesn’t follow me
 * 1 → I follow him
 * 2 → He follows me
 * 3 → Both follow each other
 * @param userData
 */
export function extractUserData(userData: any) {
  const result = userData.data.user.result;
  const nameParts = result.core?.name?.split(' ') || [];
  const firstName = nameParts[0] || '';
  const lastName = nameParts.slice(1).join(' ') || '';

  const picture = (result.avatar?.image_url || '').replace('normal', '200x200');

  // Determine degree
  const following = result.relationship_perspectives?.following || false;
  const meFollowed = result.relationship_perspectives?.followed_by || false;

  let degree = 0;
  if (following && meFollowed) {
    degree = 3;
  } else if (following) {
    degree = 1;
  } else if (meFollowed) {
    degree = 2;
  }

  return {
    firstName: firstName!,
    lastName: lastName!,
    picture: picture!,
    degree: degree,
    pending: false,
  };
}
