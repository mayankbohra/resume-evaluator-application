import { motion } from 'framer-motion';

const ModernLoader = ({ message }) => {
  return (
    <div className="flex flex-col items-center justify-center">
      <div className="relative w-32 h-32">
        {/* Outer rotating circle */}
        <motion.div
          className="absolute inset-0 border-4 border-primary-200 rounded-full"
          animate={{
            rotate: 360
          }}
          transition={{
            duration: 2,
            ease: "linear",
            repeat: Infinity
          }}
        >
          {/* Moving dot */}
          <motion.div
            className="absolute -top-1 left-1/2 w-3 h-3 bg-primary-600 rounded-full"
            animate={{
              scale: [1, 1.2, 1]
            }}
            transition={{
              duration: 1,
              repeat: Infinity
            }}
          />
        </motion.div>

        {/* Inner pulsing circle */}
        <motion.div
          className="absolute inset-4 bg-primary-100 rounded-full"
          animate={{
            scale: [1, 1.1, 1]
          }}
          transition={{
            duration: 2,
            repeat: Infinity
          }}
        />
      </div>

      <motion.div
        className="mt-8 text-center"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5 }}
      >
        <h3 className="text-xl font-display font-semibold text-secondary-800 mb-2">
          {message.title}
        </h3>
        <p className="text-secondary-600">
          {message.description}
        </p>
      </motion.div>
    </div>
  );
};

export default ModernLoader;
