export default function Logo({ size }: { size?: number }) {
  return <span className="logo" style={size ? { fontSize: size } : undefined}>kurz<i>clip</i></span>;
}
