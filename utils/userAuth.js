export const userRegister = (n) => {
  return {
    name: "test",
    email: `test${n}@test.com`,
    password: "test123",
  };
};

export const userLogin = (n) => {
  return {
    email: `test${n}@test.com`,
    password: "test123",
  };
};
