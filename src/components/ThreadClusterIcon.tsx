import React from 'react';

interface ThreadClusterIconProps extends React.SVGProps<SVGSVGElement> {
  className?: string;
  size?: number | string;
}

/**
 * ThreadClusterIcon - A handcrafted messy cluster / tangle of white handloom threads,
 * spun yarn loops, warp & weft fibers celebrating traditional Indian pit-loom weaving.
 */
export const ThreadClusterIcon: React.FC<ThreadClusterIconProps> = ({
  className = 'w-4 h-4',
  size,
  ...props
}) => {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={`inline-block shrink-0 ${className}`}
      style={size ? { width: size, height: size } : undefined}
      aria-hidden="true"
      {...props}
    >
      {/* Cluster core shadow / soft depth */}
      <circle cx="12" cy="12" r="8" fill="currentColor" fillOpacity="0.08" />

      {/* Outer looping thread 1 */}
      <path
        d="M6 14.5C4.2 12.8 4 9.5 6.2 7.2C8.6 4.7 13 4.8 15.5 7C17.8 9 18.2 13 16.2 15.5C14.5 17.6 11 18.8 8.5 17.5C6.5 16.5 6.2 13.8 7.8 12.2C9.8 10.2 13.5 10.5 15.2 12.8C16.5 14.6 15.8 17.2 13.8 18.2C11.5 19.3 8 18.5 6.8 16"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />

      {/* Crossing tangled thread strand 2 */}
      <path
        d="M17.5 7.5C19 9.8 18.5 13.5 16 15.8C13.2 18.3 8.8 18 6.5 15.2C4.5 12.8 5.2 8.8 8 6.8C10.5 5 14.8 5.5 16.5 8.2C17.8 10.4 16.8 13.5 14.5 14.8C12.5 16 9.5 15.2 8.5 13C7.5 10.8 9.2 8.5 11.5 8C14.2 7.5 16.8 9.5 17 12.5C17.2 15 15.5 17.5 13 18.5"
        stroke="currentColor"
        strokeWidth="1.3"
        strokeLinecap="round"
        strokeLinejoin="round"
      />

      {/* Tangled center knot loop 3 */}
      <path
        d="M9.5 9C8 10.5 8.2 13.2 10 14.8C11.8 16.2 14.5 15.8 15.5 13.8C16.5 11.8 15.2 9.5 13 9.2C11.2 9 9.8 10.5 10.2 12.2C10.5 13.5 12 14.2 13.2 13.8C14.2 13.5 14.5 12.2 14 11.2"
        stroke="currentColor"
        strokeWidth="1.4"
        strokeLinecap="round"
      />

      {/* Loose thread ends shooting out like real raw messy handloom yarn */}
      <path
        d="M4.5 9.5C3.2 8.8 2.5 9.8 2 10.5"
        stroke="currentColor"
        strokeWidth="1.3"
        strokeLinecap="round"
      />
      <path
        d="M19 14.5C20.5 15 21.8 14.2 22.5 13.5"
        stroke="currentColor"
        strokeWidth="1.3"
        strokeLinecap="round"
      />
      <path
        d="M14 4C14.8 2.8 16 2.2 17 2"
        stroke="currentColor"
        strokeWidth="1.2"
        strokeLinecap="round"
      />
      <path
        d="M8.5 19.5C8 20.8 7.2 21.8 6.5 22.5"
        stroke="currentColor"
        strokeWidth="1.2"
        strokeLinecap="round"
      />

      {/* Fine inner accent strands for high-density thread cluster effect */}
      <path
        d="M10 7.5Q12.5 10 15 8M9 16.5Q12 14 14.5 16"
        stroke="currentColor"
        strokeWidth="1"
        strokeLinecap="round"
        strokeDasharray="0.8 1.2"
      />
    </svg>
  );
};

export default ThreadClusterIcon;
