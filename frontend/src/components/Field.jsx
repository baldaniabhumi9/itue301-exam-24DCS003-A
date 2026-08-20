export default function Field({ label, name, value, onChange, type = 'text', required = true }) {
  return <label><span>{label}</span><input name={name} type={type} value={value} onChange={onChange} required={required} /></label>;
}
