const PrimaryButton = ({ children, type = "button", onClick, disabled = false }) => (
  <button type={type} onClick={onClick} disabled={disabled}
    className={`w-full mt-6 bg-primary text-white py-3 rounded-xl font-semibold transition
      ${disabled ? "opacity-50 cursor-not-allowed" : "hover:opacity-90"}`}
  >
    {children}
  </button>
);

export default PrimaryButton