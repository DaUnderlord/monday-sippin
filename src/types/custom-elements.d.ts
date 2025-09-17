/// <reference types="react" />

declare global {
  namespace JSX {
    interface IntrinsicElements {
      "lottie-player": React.DetailedHTMLProps<React.HTMLAttributes<HTMLElement>, HTMLElement> & {
        src?: string;
        background?: string;
        speed?: number | string;
        loop?: boolean | string;
        autoplay?: boolean | string;
        style?: React.CSSProperties;
      };
    }
  }
}

export {};
