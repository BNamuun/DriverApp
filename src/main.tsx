import { createRoot } from "react-dom/client"
import "leaflet/dist/leaflet.css"
import App from "./App.tsx"
import "./index.css"
import AppLayout from "./components/layout/AppLayout.tsx"

createRoot(document.getElementById("root")!).render(
  <AppLayout>
    <App />
  </AppLayout>
)
