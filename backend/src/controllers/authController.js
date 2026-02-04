export const signup = async (req, res) => {
  try {
    const {name, email, password} = req.body;

    //name
    if (!name || name.length < 2) {
      return res.status(400).json({
        message: "Name must be at least 2 characters"
      });
    }

    //email
    if (!email || !email.includes("@") || !email.includes(".")) {
      return res.status(400).json({
        message: "Invalid email"
      });
    }

    //password
    if (!password || password.length < 6) {
      return res.status(400).json({
        message: "Password must be at least 6 characters"
      });
    }

    return res.status(200).json({
      message: "Validation passed"
    });


  } catch (error) {
    return res.status(500).json({
      message: "Server error"
    });
  }
};
