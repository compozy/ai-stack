# @acme/ui

The UI library: components installed from the public shadcn and ReUI registries with the shadcn
CLI (`shadcn@4.23.0`, 2026-11-15), kept as they came.

- `src/components/*.tsx`: shadcn Base Nova components on Base UI (MIT, `LICENSES/shadcn-MIT.txt`),
  from `https://ui.shadcn.com`.
- `src/components/reui/*`: ReUI components (MIT, `LICENSES/reui-MIT.txt`), from the `@reui`
  registry in `components.json` (`https://reui.io`). Multi-file modules keep their folder
  (`data-grid/`, `filters/`, `cascader/`, `event-calendar/`, `gantt/`, `code-block/`). `alert` and
  `badge` exist in both: the shadcn one at `components/<name>`, the ReUI one at
  `components/reui/<name>`.
- `src/hooks/*`: hooks from both registries.
- `src/lib/utils.ts` (`cn`) and `src/lib/icons.ts` (re-exports `lucide-react`, the icon library
  the components use): import icons in apps from `@acme/ui/lib/icons`.
- `src/styles/contract.css`: the stylesheet the components need (shadcn's `tailwind.css`, ReUI's
  tokens and utilities). `src/styles/theme.css`: the neutral default theme, including ReUI's
  extra tokens (`success`, `info`, `warning`, `invert`, `focus`, `destructive-foreground`);
  replace its values with the project brand.

Add or update components from this folder:

```bash
bunx shadcn add <name>          # shadcn, e.g. bunx shadcn add accordion
bunx shadcn add @reui/<name>    # ReUI, e.g. bunx shadcn add @reui/data-grid
```

Keep vendored files as they are: lint and React Doctor skip `src/components/**` (except stories)
and `src/hooks/**`, and this package turns off `noUncheckedIndexedAccess`, which the upstream
sources do not follow. An app type-checks the files it imports with its own, stricter settings,
so the first time an app imports a ReUI module, add the missing index checks to that module.
