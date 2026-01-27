const AuthFooterLink = ({ text, linkText, onClick }) => (
  <p className="text-sm text-center mt-4 text-muted">
    {text}{" "}
    <span
      onClick={onClick}
      className="text-primary cursor-pointer font-semibold"
    >
      {linkText}
    </span>
  </p>
);

export default AuthFooterLink