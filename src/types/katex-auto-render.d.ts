declare module "katex/contrib/auto-render" {
  export interface Delimiter {
    left: string;
    right: string;
    display: boolean;
  }

  export interface AutoRenderOptions {
    delimiters?: Delimiter[];
    throwOnError?: boolean;
    errorColor?: string;
    ignoredTags?: string[];
    ignoredClasses?: string[];
    fleqn?: boolean;
  }

  export default function renderMathInElement(
    element: HTMLElement,
    options?: AutoRenderOptions
  ): void;
}
