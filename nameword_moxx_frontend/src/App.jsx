import Router from "./routes/Router"
import { AuthProvider } from "./context/AuthContext"
import { validateEnvironment } from "./config/api"
import ErrorBoundary from "./components/common/ErrorBoundary"

// Validate environment on app start
validateEnvironment();

function App() {
  return (
    <ErrorBoundary>
      <AuthProvider>
        <Router/>
      </AuthProvider>
    </ErrorBoundary>
  )
}

export default App
