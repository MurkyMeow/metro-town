module.exports = {
  apps: [
    {
      name: "npm run ts-watch",
      script: "npm",
      args: "run ts-watch",
    },
    {
      name: "npm run wds",
      script: "npm",
      args: "run wds",
    },
    {
      name: "npx gulp dev",
      script: "npx",
      args: "gulp dev",
    },
  ],
};
