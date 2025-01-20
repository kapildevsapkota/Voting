import { useEffect, useState } from "react";

export function useErrorCapture() {
  const [errors, setErrors] = useState<string[]>([]);

  useEffect(() => {
    const originalError = console.error;

    console.error = (...args: unknown[]) => {
      setErrors((prev) => [...prev, args.join(" ")]);
      originalError(...args);
    };

    return () => {
      console.error = originalError; // Restore original console.error
    };
  }, []);

  return errors;
} 