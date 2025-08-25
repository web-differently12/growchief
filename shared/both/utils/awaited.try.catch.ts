export const awaitedTryCatch = async <T>(
  activity: () => Promise<T>,
): Promise<T | null> => {
  try {
    return await activity();
  } catch (err) {
    return null;
  }
};
