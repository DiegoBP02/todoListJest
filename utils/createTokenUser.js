const createTokenUser = (user) => {
  return {
    name: user.name,
    email: user.email,
    userId: user._id,
  };
};

export default createTokenUser;
