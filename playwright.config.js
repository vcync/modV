const config = {
  testDir: "./tests/e2e",

  timeout: 60000,

  expect: {
    toMatchSnapshot: { threshold: 0.2 }
  }
};

export default config;
