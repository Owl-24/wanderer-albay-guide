import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";
import axios from "axios";

const WEATHER_API_KEY = "025726ae353d8aafa5f04c4cf8f38747"; // <-- replace with your real API key
const WEATHER_API_URL = `https://api.openweathermap.org/data/2.5/weather?q=Legazpi,PH&appid=${WEATHER_API_KEY}&units=metric`;

const alertVariants = cva(
  "relative w-full rounded-lg border p-4 bg-background text-foreground shadow-sm flex flex-col items-center text-center",
  {
    variants: {
      variant: {
        default: "",
        destructive:
          "border-destructive/50 text-destructive dark:border-destructive [&>svg]:text-destructive",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  },
);

const Alert = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement> & VariantProps<typeof alertVariants>
>(({ className, variant, ...props }, ref) => {
  const [weather, setWeather] = React.useState<any>(null);
  const [loading, setLoading] = React.useState<boolean>(true);
  const [error, setError] = React.useState<string | null>(null);

  React.useEffect(() => {
    axios
      .get(WEATHER_API_URL)
      .then((res) => {
        setWeather(res.data);
        setLoading(false);
      })
      .catch(() => {
        setError("Unable to fetch weather data.");
        setLoading(false);
      });
  }, []);

  // Choose an emoji or icon based on weather condition
  const getWeatherIcon = (condition: string) => {
    const desc = condition.toLowerCase();
    if (desc.includes("cloud")) return "☁️";
    if (desc.includes("rain")) return "🌧️";
    if (desc.includes("clear")) return "☀️";
    if (desc.includes("thunderstorm")) return "⛈️";
    if (desc.includes("drizzle")) return "🌦️";
    if (desc.includes("mist") || desc.includes("fog")) return "🌫️";
    return "🌡️";
  };

  return (
    <div
      ref={ref}
      role="alert"
      className={cn(alertVariants({ variant }), className)}
      {...props}
    >
      {loading ? (
        <p className="text-sm animate-pulse text-muted-foreground">
          Loading current weather...
        </p>
      ) : error ? (
        <p className="text-red-500">{error}</p>
      ) : weather ? (
        <>
          <div className="text-5xl mb-2">
            {getWeatherIcon(weather.weather[0].main)}
          </div>
          <h5 className="text-lg font-semibold mb-1">
            Weather in Albay (Legazpi)
          </h5>
          <p className="capitalize mb-1 text-muted-foreground">
            {weather.weather[0].description}
          </p>
          <div className="text-sm space-y-1">
            <p>🌡️ Temperature: {weather.main.temp}°C</p>
            <p>💧 Humidity: {weather.main.humidity}%</p>
            <p>🌬️ Wind Speed: {weather.wind.speed} m/s</p>
          </div>
        </>
      ) : null}
    </div>
  );
});
Alert.displayName = "Alert";

export { Alert };
