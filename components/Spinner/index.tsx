import { keyframes, Box } from "@jjasonn.stone/design-system";

const rotate = keyframes({
  "100%": { transform: "rotate(360deg)" },
});

const Index = ({ css = {}, speed = "1s" }) => (
  <Box
    css={{
      border: "3px solid",
      borderColor: "$neutral4",
      borderRadius: "50%",
      borderTopColor: "$primary10",
      width: 26,
      height: 26,
      maxWidth: 26,
      maxHeight: 26,
      animation: `${rotate} ${speed} linear`,
      animationIterationCount: "infinite",
      ...css,
    }}
  />
);

export default Index;
