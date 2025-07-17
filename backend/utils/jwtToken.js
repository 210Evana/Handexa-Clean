export const sendToken = (user, statusCode, res, message) => {
  const token = user.getJWTToken();
  const options = {
    expires: new Date(
      Date.now() + process.env.COOKIE_EXPIRE * 24 * 60 * 60 * 1000
    ),
    httpOnly: true, // Set httpOnly to true
    secure: process.env.NODE_ENV === "production", // Set secure to true in production
    sameSite: "Strict", // Set SameSite attribute to Strict for better security
  };

 res.status(statusCode)
  .cookie("token", token, options)
  .json({
    success: true,
    user: {
      _id: user._id,
      name: user.name,
      email: user.email,
      phone: user.phone,
      role: user.role,
    },
    message,
    token,
  });

};
