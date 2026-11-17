export default {
  ignore: {
    // Vendored from shadcn and ReUI and kept as is (README.md): updates replace these files,
    // so diagnostics here have no owner. Code written in this package still gets scanned.
    files: ["src/components/**", "src/hooks/**"],
  },
};
