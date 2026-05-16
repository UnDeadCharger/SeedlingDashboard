import { useCallback, useState } from "react";

import { apiClient } from "@/api/apiClient";

import type { OnCommandProp } from "@/types/commands";

/**
 * Returns a `send` function that POSTs a command to the API.
 * The ESP32 picks up the command on its next 3-second POST cycle.
 *
 * @param {string} url     – your API endpoint
 * @returns {{
 *   send:    (payload: object) => Promise<void>,
 *   loading: boolean,       – true while the POST is in-flight
 *   error:   string|null,   – last error message, null if OK
 * }}
 *
 * Usage:
 *   const { send, loading, error } = useSendCommand("/api/seedling");
 *   await send({ cmd: "set_mode", params: { mode: "manual" } });
 *   await send({ cmd: "manual_run", params: { light: 30, fan: 60, mist: 10 } });
 *   await send({ cmd: "stop" });
 *   await send({ cmd: "reboot" });
 */

export function useSendCommand() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const send = useCallback((payload: OnCommandProp) => {
    setLoading(true);
    setError(null);
    try {
      apiClient.post("/commands", payload);
      // biome-ignore lint/suspicious/noExplicitAny: <explanation>
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, []);

  return { send, loading, error };
}
