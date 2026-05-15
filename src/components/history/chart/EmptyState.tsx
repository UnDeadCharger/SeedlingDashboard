function EmptyState({ small = false }) {
  return (
    <div
      style={{
        height: small ? 180 : 260,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        color: "var(--text-m)",
        fontSize: "0.82rem",
        fontStyle: "italic",
      }}
    >
      No data in selected range
    </div>
  );
}

export default EmptyState;
