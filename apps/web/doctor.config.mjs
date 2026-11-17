export default {
  ignore: {
    // Build output, including bundled third-party packages.
    files: [".output/**", "storybook-static/**"],
    overrides: [
      {
        // Auth runs through the Better Auth client, so the form submit stays on the client.
        files: ["src/components/login-form.tsx"],
        rules: ["react-doctor/no-prevent-default"],
      },
    ],
  },
};
