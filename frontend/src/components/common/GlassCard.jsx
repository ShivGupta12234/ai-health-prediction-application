import { motion } from "framer-motion";

const GlassCard = ({
  children,
  className = "",
  hover = true,
  delay = 0,
  glowColor = "accent",
  onClick,
  ...props
}) => {
  const glowClasses = {
    accent: "hover:shadow-accent/10",
    green: "hover:shadow-neon-green/10",
    danger: "hover:shadow-danger/10",
    blue: "hover:shadow-neon-blue/10",
    purple: "hover:shadow-neon-purple/10",
    orange: "hover:shadow-neon-orange/10",
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-50px" }}
      transition={{ duration: 0.5, delay, ease: "easeOut" }}
      whileHover={hover ? { y: -4, transition: { duration: 0.3 } } : {}}
      className={`
        bg-white/[0.04] backdrop-blur-xl border border-white/[0.08] rounded-2xl shadow-2xl
        ${hover ? `transition-all duration-500 hover:bg-white/[0.08] hover:border-white/[0.15] ${glowClasses[glowColor] || glowClasses.accent}` : ""}
        ${className}
      `}
      onClick={onClick}
      {...props}
    >
      {children}
    </motion.div>
  );
};

export default GlassCard;
