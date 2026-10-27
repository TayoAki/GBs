import { Image, StyleSheet, View } from "react-native";
import appMark from "../assets/monochrome-icon.png";
import { native, useThemedStyles } from "../lib/native";

const MARK = 56;
// The badge of the 1024 px monochrome icon, framed by a circle that clears its corners.
const CROP = { x: 172, y: 173, size: 680 };
const SCALE = MARK / CROP.size;

export function AppMark() {
  const styles = useThemedStyles(createAppMarkStyles);
  return (
    <View
      accessible={false}
      accessibilityElementsHidden
      importantForAccessibility="no-hide-descendants"
      style={styles.circle}
    >
      <Image source={appMark} style={styles.image} />
    </View>
  );
}

function createAppMarkStyles() {
  return StyleSheet.create({
    circle: {
      width: MARK,
      height: MARK,
      borderRadius: MARK / 2,
      overflow: "hidden",
      alignSelf: "center",
    },
    image: {
      position: "absolute",
      width: 1024 * SCALE,
      height: 1024 * SCALE,
      left: -CROP.x * SCALE,
      top: -CROP.y * SCALE,
      tintColor: native.label,
    },
  });
}
