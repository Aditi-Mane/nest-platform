const RememberForgotRow = ({ onForgot }) => (
  <div className="flex justify-center items-center text-sm mt-3">
    <span
      onClick={onForgot}
      className="text-muted cursor-pointer font-medium"
    >
      Forgot Password?
    </span>
  </div>
);

export default RememberForgotRow