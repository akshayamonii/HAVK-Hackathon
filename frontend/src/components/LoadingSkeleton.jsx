export default function LoadingSkeleton({ count = 3, height = 'h-44' }) {
  return (
    <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3" role="status" aria-label="Loading">
      {Array.from({ length: count }, (_, i) => (
        <div key={i} className={`shimmer rounded-2xl ${height}`} />
      ))}
    </div>
  )
}
