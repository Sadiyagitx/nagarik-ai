export default function IndiaFlag({ size = 22 }) {
  return (
    <svg
      width={size}
      height={Math.round(size * 0.667)}
      viewBox="0 0 900 600"
      style={{ borderRadius: 2, display: "block" }}
    >
      <rect width="900" height="200" fill="#FF9933" />
      <rect y="200" width="900" height="200" fill="#FFFFFF" />
      <rect y="400" width="900" height="200" fill="#138808" />

      <circle
        cx="450"
        cy="300"
        r="60"
        fill="none"
        stroke="#000080"
        strokeWidth="7"
      />
      <circle cx="450" cy="300" r="8" fill="#000080" />

      {Array.from({ length: 24 }, (_, i) => {
        const a = (i / 24) * Math.PI * 2;
        return (
          <line
            key={i}
            x1="450"
            y1="300"
            x2={450 + 52 * Math.cos(a)}
            y2={300 + 52 * Math.sin(a)}
            stroke="#000080"
            strokeWidth="2"
          />
        );
      })}
    </svg>
  );
}