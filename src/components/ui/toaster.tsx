"use client";

import { useToast } from "@/hooks/use-toast";
import {
  Toast,
  ToastClose,
  ToastDescription,
  ToastProvider,
  ToastTitle,
  ToastViewport,
} from "@/components/ui/toast";

interface ToasterProps {
  errors: string[]; // Accept errors as a prop
}

export function Toaster({ errors }: ToasterProps) {
  const { toasts } = useToast();

  return (
    <ToastProvider>
      {toasts.map(function ({ id, title, description, action, ...props }) {
        return (
          <Toast key={id} {...props}>
            <div className="grid gap-1">
              {title && <ToastTitle>{title}</ToastTitle>}
              {description && (
                <ToastDescription>{description}</ToastDescription>
              )}
            </div>
            {action}
            <ToastClose />
          </Toast>
        );
      })}
      {errors.map(
        (
          error,
          index // Display errors
        ) => (
          <Toast key={`error-${index}`} variant="destructive">
            <ToastDescription>{error}</ToastDescription>
            <ToastClose />
          </Toast>
        )
      )}
      <ToastViewport />
    </ToastProvider>
  );
}
