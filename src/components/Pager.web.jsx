import React, { forwardRef, useImperativeHandle, useRef } from 'react';
import { ScrollView, View, Dimensions } from 'react-native';

const Pager = forwardRef(({ children, style, initialPage = 0, onPageSelected, ...props }, ref) => {
  const scrollViewRef = useRef(null);
  const width = Dimensions.get('window').width;

  useImperativeHandle(ref, () => ({
    setPage: (index) => {
      scrollViewRef.current?.scrollTo({ x: index * width, animated: true });
    },
  }));

  const handleScroll = (event) => {
    const x = event.nativeEvent.contentOffset.x;
    const index = Math.round(x / width);
    if (onPageSelected) {
      onPageSelected({ nativeEvent: { position: index } });
    }
  };

  return (
    <ScrollView
      ref={scrollViewRef}
      horizontal
      pagingEnabled
      showsHorizontalScrollIndicator={false}
      onMomentumScrollEnd={handleScroll}
      style={style}
      contentOffset={{ x: initialPage * width, y: 0 }}
      {...props}
    >
      {React.Children.map(children, (child) => (
        <View style={{ width }}>{child}</View>
      ))}
    </ScrollView>
  );
});

export default Pager;
