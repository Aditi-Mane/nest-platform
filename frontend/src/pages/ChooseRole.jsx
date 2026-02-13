import { HiMiniShoppingBag } from "react-icons/hi2";
import { GiSellCard} from "react-icons/gi";
import { useState } from "react";
import api from "../api/axios.js";
import { useNavigate } from "react-router-dom";

const ChooseRole = () => {
  const navigate = useNavigate();

  const [selectedRole, setSelectedRole] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleRole = async () =>{
    try {
      if (!selectedRole) {
        setError("Please select a role to continue");
        return;
      }

      setError("");
      setLoading(true);

      const res = await api.patch(
        "/choose-role", 
        {
          selectedRole
        } 
      )

      const role = res?.data?.activeRole;

      if(role === "seller") {
        navigate("/marketplace/seller");
      } else {
        navigate("/marketplace/buyer");
      }
    } catch (error) {
      setError(error?.response?.data?.message || "Something went wrong");
    } finally {
      setLoading(false)
    }
  }

  const roles = [
    {
      key: "buyer",
      title: "I want to buy",
      description: "Looking for books, notes, and other items from students",
      icon: <HiMiniShoppingBag className="text-3xl text-blue-600" />,
      bg: "bg-blue-100",
      features: [
        "Browse marketplace",
        "Shopping cart",
        "Message sellers"
      ]
    },
    {
      key: "seller",
      title: "I want to sell",
      description: "Ready to list my items and reach buyers on campus",
      icon: <GiSellCard className="text-3xl text-green-600" />,
      bg: "bg-green-100",
      features: [
        "Create listings",
        "Track sales analytics",
        "Find collaborators"
      ]
    }
  ];

  return (
    <div className="min-h-screen bg-background flex flex-col items-center justify-center px-4">

      {/* Heading */}
      <h1 className="text-4xl font-semibold text-text text-center">
        Welcome to <span className="text-purple-700">Nest!</span>
      </h1>

      <p className="text-muted text-center mt-3 max-w-xl">
        Choose your mode to personalize your experience. You can always switch later!
      </p>

      {/* Cards */}
      <div className="grid md:grid-cols-2 gap-8 mt-12 w-full max-w-2xl">

        {roles.map(role => {

          const isSelected = selectedRole === role.key;

          return (
            <div
              key={role.key}
              onClick={() => !loading && setSelectedRole(role.key)}
              className={`
                cursor-pointer
                bg-card border rounded-2xl p-8 shadow-sm text-center transition
                ${isSelected
                  ? "border-primary ring-2 ring-primary/40"
                  : "border-border hover:border-primary/40"}
                ${loading ? "opacity-60 pointer-events-none" : ""}
              `}
            >
              <div className={`w-16 h-16 mx-auto rounded-full ${role.bg} flex items-center justify-center mb-5`}>
                {role.icon}
              </div>

              <h3 className="text-lg font-semibold text-text">
                {role.title}
              </h3>

              <p className="text-sm text-muted mt-2">
                {role.description}
              </p>

              <ul className="text-sm text-text mt-4 space-y-1">
                {role.features.map((f, i) => (
                  <li key={i}>{f}</li>
                ))}
              </ul>
            </div>
          );
        })}
      </div>

      {/* CTA */}
      <button
        onClick={handleRole}
        disabled={!selectedRole || loading}
        className={`
          mt-12 px-8 py-3 rounded-full font-medium shadow-sm transition
          ${selectedRole && !loading
            ? "bg-primary text-white hover:opacity-90"
            : "bg-muted text-text cursor-not-allowed"}
        `}
      >
        {loading ? "Setting up..." : "Continue"}
      </button>

    </div>
  );
};

export default ChooseRole;
