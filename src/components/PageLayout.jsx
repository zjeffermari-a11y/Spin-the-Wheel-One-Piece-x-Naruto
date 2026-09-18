import { motion, AnimatePresence } from 'framer-motion';

export default function PageLayout({ children, bgImage }) {
  return (
    <div className="relative min-h-screen w-full overflow-hidden">
      <AnimatePresence mode="wait">
        {/* Fixed Background Layer */}
        <motion.div
          key={bgImage}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.6, ease: "easeInOut" }}
          className="fixed inset-0 z-[-1] bg-cover bg-center bg-no-repeat"
          style={{ backgroundImage: `url('${bgImage}')` }}
        />
      </AnimatePresence>

      {/* Main Content Overlay */}
      <div className="relative z-10 w-full min-h-screen">
        {children}
      </div>
    </div>
  );
}
