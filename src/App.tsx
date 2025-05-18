import { ComponentType, ReactNode } from "react";
import { Route, Switch } from "wouter";

type PageComponentProps = { params?: Record<string, string | undefined> };
type LayoutComponentProps = {
  children: ReactNode;
  params?: Record<string, string | undefined>;
};

const pageModules = import.meta.glob("/src/pages/**/page.tsx", {
  eager: true,
}) as Record<string, { default: ComponentType<PageComponentProps> }>;

const layoutModules = import.meta.glob("/src/pages/**/layout.tsx", {
  eager: true,
}) as Record<string, { default: ComponentType<LayoutComponentProps> }>;

const routes = Object.keys(pageModules).map((filePath) => {
  const PageComponent = pageModules[filePath].default;

  const relativePath = filePath.substring("/src/pages".length);
  const pathHierarchy = relativePath.split("/").filter(Boolean).slice(0, -1);

  const layouts: ComponentType<LayoutComponentProps>[] = [];
  let routePath = "";

  pathHierarchy.forEach((segment, index) => {
    if (segment.startsWith("[") && segment.endsWith("]")) {
      const strippedSegment = segment.slice(1, -1);
      routePath += `/:${strippedSegment}`;
    } else if (!(segment.startsWith("(") && segment.endsWith(")"))) {
      routePath += `/${segment}`;
    }

    const layoutFilePath = `/src/pages/${pathHierarchy
      .slice(0, index + 1)
      .join("/")}/layout.tsx`;
    if (layoutModules[layoutFilePath]) {
      layouts.push(layoutModules[layoutFilePath].default);
    }
  });

  return {
    path: routePath,
    Component: PageComponent,
    layouts,
    originalFilePath: filePath,
  };
});

routes.sort((a, b) => {
  const aPath = a.path;
  const bPath = b.path;

  const aSegments = aPath.split("/").filter(Boolean);
  const bSegments = bPath.split("/").filter(Boolean);

  if (aSegments.length !== bSegments.length) {
    return bSegments.length - aSegments.length;
  }

  const aDynamicCount = (aPath.match(/:/g) || []).length;
  const bDynamicCount = (bPath.match(/:/g) || []).length;
  if (aDynamicCount !== bDynamicCount) {
    return aDynamicCount - bDynamicCount;
  }

  for (let i = 0; i < aSegments.length; i++) {
    const aIsDynamic = aSegments[i].startsWith(":");
    const bIsDynamic = bSegments[i].startsWith(":");
    if (!aIsDynamic && bIsDynamic) return -1;
    if (aIsDynamic && !bIsDynamic) return 1;
  }

  return aPath.localeCompare(bPath);
});

export default function App() {
  return (
    <Switch>
      {routes.map(({ path, Component, layouts, originalFilePath }) => {
        const RouteContentWrapper = (props: {
          params: Record<string, string | undefined>;
        }) => {
          let content = <Component {...props} />;

          for (let i = layouts.length - 1; i >= 0; i--) {
            const LayoutComponent = layouts[i];
            content = (
              <LayoutComponent params={props.params}>{content}</LayoutComponent>
            );
          }
          return content;
        };

        return (
          <Route key={originalFilePath} path={path}>
            {(params) => <RouteContentWrapper params={params} />}
          </Route>
        );
      })}
      <Route>
        <h1>404: No such page!</h1>
      </Route>
    </Switch>
  );
}
