"use client"

import type React from "react"

import { motion, AnimatePresence } from "framer-motion"

interface FeedTransitionProps {
  children: React.ReactNode
  isLoading?: boolean
  mode: "infinite" | "manual"
}

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
    },
  },
}

const itemVariants = {
  hidden: {
    opacity: 0,
    y: 20,
    scale: 0.95,
  },
  visible: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: {
      type: "spring",
      stiffness: 100,
      damping: 15,
    },
  },
}

const pageTransitionVariants = {
  initial: { opacity: 0, x: 20 },
  animate: { opacity: 1, x: 0 },
  exit: { opacity: 0, x: -20 },
}

export function FeedTransition({ children, mode }: FeedTransitionProps) {
  if (mode === "manual") {
    return (
      <AnimatePresence mode="wait">
        <motion.div
          key="manual-feed"
          variants={pageTransitionVariants}
          initial="initial"
          animate="animate"
          exit="exit"
          transition={{ duration: 0.3, ease: "easeInOut" }}
        >
          <motion.div
            variants={containerVariants}
            initial="hidden"
            animate="visible"
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
          >
            {children}
          </motion.div>
        </motion.div>
      </AnimatePresence>
    )
  }

  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
    >
      {children}
    </motion.div>
  )
}

export function FeedItemWrapper({ children, index }: { children: React.ReactNode; index: number }) {
  return (
    <motion.div
      variants={itemVariants}
      layout
      layoutId={`feed-item-${index}`}
      whileHover={{
        scale: 1.02,
        transition: { duration: 0.2 },
      }}
      whileTap={{ scale: 0.98 }}
    >
      {children}
    </motion.div>
  )
}
