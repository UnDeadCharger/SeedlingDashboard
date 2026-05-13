/**
 * Capitalizes the first letter of a string.
 */
export const capitalize = (str: string): string => str.charAt(0).toUpperCase() + str.slice(1);

/**
 * Formats an ISO date string to a human-readable format.
 */
export const formatDate = (iso: string): string =>
  new Date(iso).toLocaleDateString(undefined, {
    year: "numeric",
    month: "long",
    day: "numeric",
  });

/**
 * Safely extracts an error message from unknown catch values.
 */
export const getErrorMessage = (error: unknown): string => {
  if (error instanceof Error) return error.message;
  return "An unexpected error occurred.";
};

export * from "./formatters";
export * from "./fanLogic";
