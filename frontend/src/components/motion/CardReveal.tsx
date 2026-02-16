"use client";

import { motion } from "framer-motion";

interface CardRevealProps {
  children: React.ReactNode;
  index?: number;
  className?: string;
}

export default function CardReveal({ children, index = 0, className }: CardRevealProps) {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95, y: 20 }}
      animate={{ opacity: 1, scale: 1, y: 0 }}
      transition={{
        duration: 0.5,
        delay: index * 0.15,
        ease: [0.22, 1, 0.36, 1],
      }}
      className={className}
    >
      {children}
    </motion.div>
  );
}
