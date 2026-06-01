import React from 'react';

// Perfect Web polyfill for react-native-svg to make sure the app compiles and runs in the browser preview
// while displaying pure identical native React Native code definitions in the editor!

export const Svg = ({ children, style, viewBox, ...props }: any) => {
  return (
    <svg 
      viewBox={viewBox} 
      style={style} 
      {...props}
    >
      {children}
    </svg>
  );
};

export const Path = (props: any) => <path {...props} />;
export const Polygon = (props: any) => <polygon {...props} />;
export const Circle = (props: any) => <circle {...props} />;
export const Defs = (props: any) => <defs {...props} />;
export const LinearGradient = (props: any) => <linearGradient {...props} />;
export const Stop = (props: any) => <stop {...props} />;

export default Svg;
