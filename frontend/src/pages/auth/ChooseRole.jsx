import { HiMiniShoppingBag } from "react-icons/hi2";
import { GiSellCard } from "react-icons/gi";

const ChooseRole = () => {
  return (
    <div className="min-h-screen bg-background flex flex-col items-center justify-center px-4">

      {/* HEADING */}
      <h1 className="text-4xl font-semibold text-text text-center">
        Welcome to <span className="text-purple-700">Nest!</span>
      </h1>

      <p className="text-muted text-center mt-3 max-w-xl">
        Choose your mode to personalize your experience. You can always switch later!
      </p>

      {/* MODE CARDS */}
      <div className="grid md:grid-cols-2 gap-8 mt-12 w-full max-w-4xl">

        {/* BUY CARD */}
        <div className="bg-card border border-border rounded-2xl p-8 shadow-sm text-center">

          <div className="w-16 h-16 mx-auto rounded-full bg-blue-100 flex items-center justify-center mb-5">
            <HiMiniShoppingBag className="text-3xl text-blue-600"/>
          </div>

          <h3 className="text-lg font-semibold text-text">
            I want to buy
          </h3>

          <p className="text-sm text-muted mt-2">
            Looking for books, notes, and other items from students
          </p>

          <ul className="text-sm text-text mt-4 space-y-1">
            <li>• Browse marketplace</li>
            <li>• Shopping cart</li>
            <li>• Message sellers</li>
          </ul>

        </div>

        {/* SELL CARD */}
        <div className="bg-card border border-border rounded-2xl p-8 shadow-sm text-center">

          <div className="w-16 h-16 mx-auto rounded-full bg-green-100 flex items-center justify-center mb-5">
            <GiSellCard className="text-3xl text-green-600"/>
          </div>

          <h3 className="text-lg font-semibold text-text">
            I want to sell
          </h3>

          <p className="text-sm text-muted mt-2">
            Ready to list my items and reach buyers on campus
          </p>

          <ul className="text-sm text-text mt-4 space-y-1">
            <li>• Create listings</li>
            <li>• Track sales analytics</li>
            <li>• Find collaborators</li>
          </ul>

        </div>

      </div>

      {/* CTA BUTTON */}
      <button className="mt-12 px-8 py-3 rounded-full bg-primary text-white font-medium shadow-sm hover:opacity-90 transition">
        Select a Mode
      </button>

    </div>
  );
};

export default ChooseRole;
