/// <reference types="vite/client" />
/// <reference types="react" />

declare global {
  namespace JSX {
    interface IntrinsicElements {
      'model-viewer': React.DetailedHTMLProps<
        React.HTMLAttributes<HTMLElement> & {
          src?: string;
          alt?: string;
          ar?: boolean | string;
          'ar-modes'?: string;
          'camera-controls'?: boolean | string;
          'auto-rotate'?: boolean | string;
          'auto-rotate-delay'?: string | number;
          'rotation-per-second'?: string;
          'shadow-intensity'?: string | number;
          'shadow-softness'?: string | number;
          exposure?: string | number;
          poster?: string;
          loading?: 'auto' | 'lazy' | 'eager';
          reveal?: 'auto' | 'manual';
          'interaction-prompt'?: string;
          'touch-action'?: string;
          'environment-image'?: string;
          'skybox-image'?: string;
          style?: React.CSSProperties;
        },
        HTMLElement
      >;
    }
  }
}

export {};
