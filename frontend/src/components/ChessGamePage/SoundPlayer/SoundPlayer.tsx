import { Howl } from "howler";
import * as Types from "./SoundPlayer.types";
import { useEffect } from "react";

const SoundPlayer = ({
  src,
  format = "mp3",
  autoplay = false,
}: Types.IProps) => {
  useEffect(() => {
    const sound = new Howl({
      src: [src],
      format: [format],
      html5: true,
      autoplay,
    });
    sound.play();

    return () => {
      sound.unload();
    };
  }, [src, format, autoplay]);

  return null;
};

export default SoundPlayer;
