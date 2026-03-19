export default function PlaceholderPage({ name }: { name: string }) {
  return (
    <div style={{
      textAlign: 'center',
      color: 'var(--text-muted)',
      marginTop: 60,
      fontSize: 14,
    }}>
      <div style={{ fontSize: 32, marginBottom: 12, opacity: 0.5 }}>{'\u2022\u2022\u2022'}</div>
      {name} &mdash; coming soon
    </div>
  )
}
