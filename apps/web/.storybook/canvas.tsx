import { Toaster } from "@acme/ui/components/toast";
import {
  createMemoryHistory,
  createRootRoute,
  createRoute,
  createRouter,
  RouterProvider,
} from "@tanstack/react-router";
import { createContext, use, useState, type ReactNode } from "react";

const Canvas = createContext<ReactNode>(null);
function Content() {
  return use(Canvas);
}

/**
 * Providers around every story: a fresh memory router per canvas (links never enter production
 * loaders or change the preview URL) and toasts. No QueryClient or API client.
 */
export function StoryCanvas({ children }: { children: ReactNode }) {
  const [router] = useState(() => {
    const root = createRootRoute({ component: Content });
    const catchAll = createRoute({ getParentRoute: () => root, path: "$" });
    return createRouter({
      routeTree: root.addChildren([catchAll]),
      history: createMemoryHistory({ initialEntries: ["/"] }),
    });
  });
  return (
    <Toaster>
      <Canvas value={children}>
        <RouterProvider router={router} />
      </Canvas>
    </Toaster>
  );
}
