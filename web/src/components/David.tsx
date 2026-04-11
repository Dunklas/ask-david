import { cn } from "../lib/utils";
import david from "../assets/david3.webp";

type Props = {
  className?: string;
  imageClassName?: string;
};

const David = ({ className, imageClassName }: Props) => (
  <div
    className={cn(
      "flex justify-center max-h-[600px] sm:max-h-[650px] md:max-h-[700px] lg:max-h-[750px] xl:max-h-[800px]",
      className,
    )}
  >
    <img
      data-testid="david"
      src={david}
      alt="David"
      className={cn("max-w-full object-scale-down", imageClassName)}
      style={{
        filter: "drop-shadow(0 0 28px rgba(0, 0, 0, 0.16))",
        WebkitMaskImage:
          "radial-gradient(ellipse at center, black 72%, transparent 100%)",
        maskImage:
          "radial-gradient(ellipse at center, black 72%, transparent 100%)",
      }}
    />
  </div>
);

export default David;
