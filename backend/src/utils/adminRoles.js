const getConfiguredAdminEmails = () =>
  (process.env.ADMIN_EMAILS || "")
    .split(",")
    .map((email) => email.trim().toLowerCase())
    .filter(Boolean);

export const syncAdminRole = (user) => {
  if (!user) {
    return false;
  }

  const configuredAdminEmails = getConfiguredAdminEmails();
  const normalizedEmail = user.email?.trim().toLowerCase();
  const hasAdminRole = user.availableRoles?.includes("admin");
  const shouldBeAdmin =
    Boolean(normalizedEmail) && configuredAdminEmails.includes(normalizedEmail);

  let changed = false;

  if (shouldBeAdmin && !hasAdminRole) {
    user.availableRoles = [...(user.availableRoles || []), "admin"];
    changed = true;
  }

  if (!shouldBeAdmin && hasAdminRole) {
    user.availableRoles = (user.availableRoles || []).filter(
      (role) => role !== "admin"
    );

    if (user.activeRole === "admin") {
      user.activeRole = user.availableRoles.includes("buyer")
        ? "buyer"
        : user.availableRoles.includes("seller")
          ? "seller"
          : null;
    }

    changed = true;
  }

  return changed;
};

export const isConfiguredAdmin = (user) =>
  Boolean(user?.availableRoles?.includes("admin"));
