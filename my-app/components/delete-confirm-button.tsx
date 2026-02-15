"use client"

import { useState, useTransition } from "react"
import { AnimatePresence, motion } from "framer-motion"
import { AlertTriangle, Loader2, Trash2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"

type DeleteConfirmButtonProps = {
  itemLabel: string
  title: string
  description: string
  onConfirm: () => Promise<void>
  className?: string
}

/**
 * Small red trash icon with animated confirmation popup.
 */
export function DeleteConfirmButton({
  itemLabel,
  title,
  description,
  onConfirm,
  className,
}: DeleteConfirmButtonProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [errorMessage, setErrorMessage] = useState<string | null>(null)
  const [isPending, startTransition] = useTransition()

  function handleConfirm() {
    startTransition(async () => {
      try {
        setErrorMessage(null)
        await onConfirm()
        setIsOpen(false)
      } catch (error) {
        setErrorMessage(
          error instanceof Error ? error.message : "Delete failed. Try again."
        )
      }
    })
  }

  return (
    <>
      <Button
        type="button"
        size="icon"
        variant="ghost"
        onClick={() => {
          setErrorMessage(null)
          setIsOpen(true)
        }}
        className={cn(
          "size-8 text-red-500 hover:bg-red-500/10 hover:text-red-600",
          className
        )}
        aria-label={`Delete ${itemLabel}`}
      >
        <Trash2 className="size-4" />
      </Button>

      <AnimatePresence>
        {isOpen ? (
          <motion.div
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => !isPending && setIsOpen(false)}
          >
            <motion.div
              role="dialog"
              aria-modal="true"
              aria-label={title}
              className="w-full max-w-md rounded-xl border bg-background p-5 shadow-xl"
              initial={{ opacity: 0, y: 16, scale: 0.96 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 16, scale: 0.96 }}
              transition={{ type: "spring", stiffness: 280, damping: 24 }}
              onClick={(event) => event.stopPropagation()}
            >
              <div className="mb-4 flex items-start gap-3">
                <div className="mt-0.5 rounded-full bg-red-500/15 p-2 text-red-600">
                  <AlertTriangle className="size-4" />
                </div>
                <div className="space-y-1">
                  <h2 className="text-base font-semibold">{title}</h2>
                  <p className="text-sm text-muted-foreground">{description}</p>
                </div>
              </div>
              {errorMessage ? (
                <p className="mb-3 text-sm text-red-600">{errorMessage}</p>
              ) : null}

              <div className="flex justify-end gap-2">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setIsOpen(false)}
                  disabled={isPending}
                >
                  Cancel
                </Button>
                <Button
                  type="button"
                  variant="destructive"
                  onClick={handleConfirm}
                  disabled={isPending}
                >
                  {isPending ? (
                    <>
                      <Loader2 className="size-4 animate-spin" />
                      Deleting...
                    </>
                  ) : (
                    "Yes, delete"
                  )}
                </Button>
              </div>
            </motion.div>
          </motion.div>
        ) : null}
      </AnimatePresence>
    </>
  )
}
