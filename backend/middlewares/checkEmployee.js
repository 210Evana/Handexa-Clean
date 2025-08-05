
export const checkEmployee = (req, res, next) => {
  if (req.user.role !== "employee") {
    return res.status(403).json({
      success: false,
      message: "Only employers can post jobs.",
    });
  }
  next();
};
