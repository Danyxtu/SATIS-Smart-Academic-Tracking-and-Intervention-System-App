import React, { forwardRef } from 'react';
import PagerView from 'react-native-pager-view';

const Pager = forwardRef(({ children, style, initialPage, onPageSelected, ...props }, ref) => {
  return (
    <PagerView
      ref={ref}
      style={style}
      initialPage={initialPage}
      onPageSelected={onPageSelected}
      {...props}
    >
      {children}
    </PagerView>
  );
});

export default Pager;
