import SeedlingDashboard from "@/components/dashboard/SeedlingDashboard";
import { useSeedlingData } from "@/hooks/useSeedlingData";

// import { useSendCommand } from "@/hooks/useSendCommand";

const API_URL = import.meta.env.VITE_API_BASE_URL;

export default function HomePage() {
  // Poll every 3 seconds (matches ESP32 POST interval)
  const { data, loading, error } = useSeedlingData(`${API_URL}/latest`, 10000);
  // const { send } = useSendCommand(API_URL);

  if (loading) {
    return (
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          minHeight: "100vh",
          background: "#050f09",
          color: "#3ddc7a",
          fontFamily: "monospace",
        }}
      >
        Connecting to device...
      </div>
    );
  }

  if (error && !data) {
    return (
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          minHeight: "100vh",
          background: "#050f09",
          color: "#ff5252",
          fontFamily: "monospace",
        }}
      >
        Connection error: {error}
      </div>
    );
  }

  return <SeedlingDashboard data={data} onCommand={() => {}} />;
}
