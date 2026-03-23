const InputField = ({ icon: Icon, type, placeholder, value, onChange, children }) => (
  <div className="mt-4 flex items-center bg-background border border-border rounded-xl px-3 py-2">
    {/* Render icon only if provided */}
    {Icon && (
      <Icon className="text-muted text-lg mr-2 shrink-0" />
    )}
    
    <input
      type={type}
      placeholder={placeholder}
      className="bg-transparent outline-none flex-1 px-2 text-text placeholder:text-muted"
      value={value}
      onChange={onChange}
    />
    {children}
  </div>
);

export default InputField