import { useNavigate } from "react-router-dom"

const LandingPage = () => {
  const navigate = useNavigate();

  return (
    <div className="h-screen flex flex-col items-center justify-center bg-background">
      <h1 className="text-4xl font-bold mb-2 text-text">NEST</h1>
      <p className="text-muted mb-6">Empowering Campus Startups</p>
      <button
        className="px-8 py-3 bg-primary text-white rounded-xl font-semibold hover:opacity-90 transition"
        onClick={() => navigate("/auth")}>
        Get Started
      </button>
    </div>
  )
}

export default LandingPage
