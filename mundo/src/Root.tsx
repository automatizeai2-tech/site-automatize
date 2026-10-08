import { Composition } from "remotion";
import { Mundo } from "./Mundo";
import { FPS, TOTAL_FRAMES } from "./cfg";

export const RemotionRoot: React.FC = () => (
  <>
    <Composition id="MundoDesktop" component={Mundo} durationInFrames={TOTAL_FRAMES} fps={FPS} width={1920} height={1080} defaultProps={{ mobile: false }} />
    <Composition id="MundoMobile" component={Mundo} durationInFrames={TOTAL_FRAMES} fps={FPS} width={1080} height={1920} defaultProps={{ mobile: true }} />
  </>
);
