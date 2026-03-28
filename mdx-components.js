import { useMDXComponents as getThemeComponents } from "nextra-theme-docs"; // nextra-theme-blog or your custom theme
import { Tabs, Cards, Steps, Callout, FileTree } from "nextra/components";

// Get the default MDX components
const themeComponents = getThemeComponents();

// Merge components
export function useMDXComponents(components) {
  return {
    ...themeComponents,
    Tabs,
    Cards,
    Steps,
    Callout,
    FileTree,
    ...components,
  };
}
