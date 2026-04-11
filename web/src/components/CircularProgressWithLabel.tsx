import { Progress } from "./ui/progress";

type Props = {
  value: number;
};

function CircularProgressWithLabel({ value }: Props) {
  const radius = 56;
  const strokeWidth = 10;
  const normalizedRadius = radius - strokeWidth / 2;
  const circumference = normalizedRadius * 2 * Math.PI;
  const strokeDashoffset =
    circumference - (Math.min(value, 100) / 100) * circumference;

  return (
    <div className="relative inline-flex h-36 w-36 items-center justify-center">
      <svg
        viewBox="0 0 112 112"
        className="h-full w-full -rotate-90"
        data-testid="spinner"
        aria-hidden="true"
      >
        <circle
          cx="56"
          cy="56"
          r={normalizedRadius}
          strokeWidth={strokeWidth}
          className="fill-transparent stroke-secondary"
        />
        <circle
          cx="56"
          cy="56"
          r={normalizedRadius}
          strokeWidth={strokeWidth}
          strokeDasharray={circumference}
          strokeDashoffset={strokeDashoffset}
          strokeLinecap="round"
          className="fill-transparent stroke-primary transition-all duration-300"
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center gap-2">
        <span
          className="text-3xl font-semibold tracking-tight text-foreground"
          data-testid="spinner-percentage"
        >{`${Math.round(value)}%`}</span>
        <Progress value={value} className="w-20" />
      </div>
    </div>
  );
}

export default CircularProgressWithLabel;
