const InputField = ({ icon: Icon, type, placeholder, children }) => (
  <div className="mt-4 flex items-center bg-background border border-border rounded-xl px-3 py-2">
    <Icon className="text-muted text-lg" />
    <input
      type={type}
      placeholder={placeholder}
      className="bg-transparent outline-none flex-1 px-2 text-text placeholder:text-muted"
    />
    {children}
  </div>
);

export default InputField