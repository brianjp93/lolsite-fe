import { type CSSProperties } from "react";

export default function Orbit({
  size = 100,
  color = "#426892",
  style,
}: {
  size?: number;
  color?: string;
  style?: CSSProperties;
}) {
  const orbit_style = { borderColor: color };
  return (
    <div
      style={{
        ...style,
        width: size,
        height: size,
      }}
      className="orbit-spinner"
    >
      <div style={orbit_style} className="orbit"></div>
      <div style={orbit_style} className="orbit"></div>
      <div style={orbit_style} className="orbit"></div>
    </div>
  );
}
