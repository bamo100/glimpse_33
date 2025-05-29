"use client"

// Inspired by react-hot-toast library
import * as React from "react"
import { toast as sonnerToast } from "sonner"

type ToasterToast = {
  id: string
  title?: React.ReactNode
  description?: React.ReactNode
  variant?: "default" | "destructive" | "success"
  action?: {
    label: string
    onClick: () => void
  }
  open?: boolean
  onOpenChange?: (open: boolean) => void
}

// eslint-disable-next-line
const actionTypes = {
  ADD_TOAST: "ADD_TOAST",
  UPDATE_TOAST: "UPDATE_TOAST",
  DISMISS_TOAST: "DISMISS_TOAST",
  REMOVE_TOAST: "REMOVE_TOAST",
} as const

let count = 0

function genId() {
  count = (count + 1) % Number.MAX_SAFE_INTEGER
  return count.toString()
}

type ActionType = typeof actionTypes

type Action =
  | {
      type: ActionType["ADD_TOAST"]
      toast: ToasterToast
    }
  | {
      type: ActionType["UPDATE_TOAST"]
      toast: Partial<ToasterToast>
    }
  | {
      type: ActionType["DISMISS_TOAST"]
      toastId?: ToasterToast["id"]
    }
  | {
      type: ActionType["REMOVE_TOAST"]
      toastId?: ToasterToast["id"]
    }

interface State {
  toasts: ToasterToast[]
}

const toastTimeouts = new Map<string, ReturnType<typeof setTimeout>>()

const addToRemoveQueue = (toastId: string) => {
  if (toastTimeouts.has(toastId)) {
    return
  }

  const timeout = setTimeout(() => {
    toastTimeouts.delete(toastId)
    dispatch({
      type: "REMOVE_TOAST",
      toastId: toastId,
    })
  }, 1000000)

  toastTimeouts.set(toastId, timeout)
}

export const reducer = (state: State, action: Action): State => {
  switch (action.type) {
    case "ADD_TOAST":
      return {
        ...state,
        toasts: [action.toast, ...state.toasts].slice(0, 1),
      }

    case "UPDATE_TOAST":
      return {
        ...state,
        toasts: state.toasts.map((t) => (t.id === action.toast.id ? { ...t, ...action.toast } : t)),
      }

    case "DISMISS_TOAST": {
      const { toastId } = action

      // ! Side effects ! - This could be extracted into a dismissToast() action,
      // but I'll keep it here for simplicity
      if (toastId) {
        addToRemoveQueue(toastId)
      } else {
        state.toasts.forEach((toast) => {
          addToRemoveQueue(toast.id)
        })
      }

      return {
        ...state,
        toasts: state.toasts.map((t) =>
          t.id === toastId || toastId === undefined
            ? {
                ...t,
                open: false,
              }
            : t,
        ),
      }
    }
    case "REMOVE_TOAST":
      if (action.toastId === undefined) {
        return {
          ...state,
          toasts: [],
        }
      }
      return {
        ...state,
        toasts: state.toasts.filter((t) => t.id !== action.toastId),
      }
  }
}

const listeners: Array<(state: State) => void> = []

let memoryState: State = { toasts: [] }

function dispatch(action: Action) {
  memoryState = reducer(memoryState, action)
  listeners.forEach((listener) => {
    listener(memoryState)
  })
}

type Toast = Omit<ToasterToast, "id">

// eslint-disable-next-line
function toast({ title, description, variant = "default", action }: Toast) {
  // eslint-disable-next-line
  const message = title || description || "" 
  const options: any = {}

  if (description && title) {
    options.description = description
  }

  if (action) {
    options.action = {
      label: action.label,
      onClick: action.onClick,
    }
  }

  const id = genId()

  const update = (props: ToasterToast) =>
    dispatch({
      type: "UPDATE_TOAST",
      toast: { ...props, id },
    })
  const dismiss = () => dispatch({ type: "DISMISS_TOAST", toastId: id })

  dispatch({
    type: "ADD_TOAST",
    toast: {
      ...(title && { title }),
      ...(description && { description }),
      variant,
      action,
      id,
      open: true,
      onOpenChange: (open) => {
        if (!open) dismiss()
      },
    },
  })

  return {
    id: id,
    dismiss,
    update,
  }
}

// function useToast() {
//   const [state, setState] = React.useState<State>(memoryState)

//   React.useEffect(() => {
//     listeners.push(setState)
//     return () => {
//       const index = listeners.indexOf(setState)
//       if (index > -1) {
//         listeners.splice(index, 1)
//       }
//     }
//   }, [state])

//   return {
//     ...state,
//     toast,
//     dismiss: (toastId?: string) => dispatch({ type: "DISMISS_TOAST", toastId }),
//   }
// }

// Simple wrapper functions for Sonner
export const toastSimple = (message: string, options?: any) => sonnerToast(message, options)

export const toastSuccess = (message: string, options?: any) => sonnerToast.success(message, options)

export const toastError = (message: string, options?: any) => sonnerToast.error(message, options)

export const toastInfo = (message: string, options?: any) => sonnerToast.info(message, options)

export const toastWarning = (message: string, options?: any) => sonnerToast.warning(message, options)

// Enhanced toast function with more options
export const toastWithOptions = (options: {
  title?: string
  description?: string
  variant?: "default" | "success" | "error" | "warning" | "info"
  action?: {
    label: string
    onClick: () => void
  }
  duration?: number
}) => {
  const { title, description, variant = "default", action, duration } = options

  const message = title || description || ""
  const toastOptions: any = {
    ...(duration && { duration }),
    ...(description && title && { description }),
    ...(action && {
      action: {
        label: action.label,
        onClick: action.onClick,
      },
    }),
  }

  switch (variant) {
    case "success":
      return sonnerToast.success(message, toastOptions)
    case "error":
      return sonnerToast.error(message, toastOptions)
    case "warning":
      return sonnerToast.warning(message, toastOptions)
    case "info":
      return sonnerToast.info(message, toastOptions)
    default:
      return sonnerToast(message, toastOptions)
  }
}

// For backward compatibility with the old toast API
export const useToastLegacy = () => {
  return {
    toast: toastWithOptions,
    dismiss: (toastId?: string | number) => sonnerToast.dismiss(toastId),
  }
}

// For backward compatibility
export { toastSimple as useToast }
