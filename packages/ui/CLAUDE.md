# @acme/ui

The UI library: shadcn Base Nova components (`src/components/<name>`) and ReUI components
(`src/components/reui/<name>`), installed from their public registries with the shadcn CLI and
kept as they came. Sources, licenses and how to add more: `README.md`.

## Rules

- Vendored components and hooks are not edited by hand: add or update them with
  `bunx shadcn add <name>` or `bunx shadcn add @reui/<name>` from this folder. A project-specific
  component is a new file outside the vendored names, composed from the vendored ones.
- Brand lives in tokens: change `src/styles/theme.css`, never colors inside a component. Keep AA
  contrast in light and dark; the Storybook a11y tests check it.
- Icons come from `@acme/ui/lib/icons`; class merging from `cn` in `@acme/ui/lib/utils`.
- Apps import by path (`@acme/ui/components/button`); there is no barrel file.
- Every component an app uses has a story; stories are the only code here that lint and React
  Doctor check.
