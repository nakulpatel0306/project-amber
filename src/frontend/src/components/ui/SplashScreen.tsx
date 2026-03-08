import { CoffeeBrewLoader } from './CoffeeBrewLoader';

export function SplashScreen({ message }: { message?: string }) {
  return (
    <CoffeeBrewLoader
      variant="fullscreen"
      size="lg"
      message={message}
      showRotatingMessages={!message}
    />
  );
}
