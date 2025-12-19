export default function Debug() {
  const backendUrl = import.meta.env.VITE_BACKEND_URL || '(not set)'
  
  return (
    <div style={{ padding: '20px', fontFamily: 'monospace' }}>
      <h1>Debug Info</h1>
      <p><strong>VITE_BACKEND_URL:</strong> {backendUrl}</p>
      <p><strong>Test URL:</strong> {backendUrl}/api/drive/health</p>
    </div>
  )
}
