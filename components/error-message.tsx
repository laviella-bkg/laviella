import { AlertCircle, X } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { cn } from "@/lib/utils"

interface ErrorMessageProps {
  title?: string
  message: string
  onRetry?: () => void
  onDismiss?: () => void
  className?: string
  variant?: "default" | "destructive"
}

export function ErrorMessage({
  title,
  message,
  onRetry,
  onDismiss,
  className,
  variant = "destructive",
}: ErrorMessageProps) {
  return (
    <Alert
      variant={variant}
      className={cn("relative", className)}
    >
      <AlertCircle className="h-4 w-4" />
      <AlertTitle className="font-semibold">{title || "Error"}</AlertTitle>
      <AlertDescription className="mt-2">{message}</AlertDescription>
      {(onRetry || onDismiss) && (
        <div className="flex gap-2 mt-4">
          {onRetry && (
            <Button
              variant="outline"
              size="sm"
              onClick={onRetry}
              className="h-8"
            >
              Reintentar
            </Button>
          )}
          {onDismiss && (
            <Button
              variant="ghost"
              size="sm"
              onClick={onDismiss}
              className="h-8"
            >
              <X className="h-4 w-4" />
            </Button>
          )}
        </div>
      )}
    </Alert>
  )
}

interface ErrorDisplayProps {
  error: Error | string | null
  onRetry?: () => void
  className?: string
}

export function ErrorDisplay({ error, onRetry, className }: ErrorDisplayProps) {
  if (!error) return null

  const errorMessage = typeof error === "string" ? error : error.message

  return (
    <div className={className}>
      <ErrorMessage
        message={errorMessage}
        onRetry={onRetry}
        variant="destructive"
      />
    </div>
  )
}
