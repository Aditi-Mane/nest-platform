const checkSeller = (req, res, next) => {
  if (
    req.user.role !== "seller" ||
    req.user.sellerStatus !== "active"
  ) {
    return res.status(403).json({
      message: "Seller access denied"
    });
  }
  next();
};