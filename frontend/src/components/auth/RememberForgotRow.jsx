const RememberForgotRow = ({ onForgot }) => (
  <div className="flex justify-between items-center text-sm mt-3">
    <label className="flex items-center gap-2 text-muted">
      <input type="checkbox" />
      Remember me
    </label>
    <span
      onClick={onForgot}
      className="text-primary cursor-pointer font-medium"
    >
      Forgot Password?
    </span>
  </div>
);

export default RememberForgotRow