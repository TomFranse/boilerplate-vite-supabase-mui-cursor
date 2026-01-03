export const getAuthCallbackParams = (searchParams: { get: (key: string) => string | null }) => {
  return {
    error: searchParams.get("error"),
    code: searchParams.get("code"),
  };
};
