import { CoffeeBrewLoader } from './CoffeeBrewLoader';

export function SplashScreen({ message }: { message?: string }) {
  return (
    <CoffeeBrewLoader
      variant="fullscreen"
      size="md"
      message={message}
      showRotatingMessages={!message}
    />
  );
}
