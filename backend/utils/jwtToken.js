// This function sends a JWT token in both cookie + JSON response
export const sendToken = (user, statusCode, res, message) => {
   // Generate JWT token from the user model method
  const token = user.getJWTToken();
    // Cookie configuration
  const options = {
    // Set cookie expiry time (converted from days → milliseconds)
    expires: new Date(
      Date.now() + process.env.COOKIE_EXPIRE * 24 * 60 * 60 * 1000
    ),
    httpOnly: true, // Set httpOnly to true
    // Prevents client-side JS (like browser scripts) from accessing the cookie
    // Helps protect against XSS attacks
    secure: true,
     // Cookie will ONLY be sent over HTTPS
    // In development (localhost), this can break if you're not using HTTPS
    sameSite: "None", 
    // Allows cookies to be sent in cross-site requests
    // Required if frontend & backend are on different domains
  };

   // Send response
 res.status(statusCode)

 // Attach cookie named "token"
  .cookie("token", token, options)

   // Send JSON response
  .json({
    success: true,
    user: {
      _id: user._id,
      name: user.name,
      email: user.email,
      phone: user.phone,
      role: user.role,
    },
    message, // Custom message (e.g. "Login successful")
    token,
    // You are ALSO sending token in response body
      // This is optional — some apps avoid this for security
  });

};
