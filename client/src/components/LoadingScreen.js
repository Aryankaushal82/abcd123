import React from 'react';
import { motion } from 'framer-motion';

const LoadingScreen = () => {
  return (
    <div className="fixed inset-0 flex items-center justify-center bg-white">
      <div className="text-center">
        <motion.div
          className="h-16 w-16 border-4 border-primary-500 border-t-transparent rounded-full mx-auto mb-4"
          animate={{ rotate: 360 }}
          transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
        />
        <h2 className="text-xl font-semibold text-gray-800">Loading...</h2>
        <p className="text-gray-500 mt-2">Please wait while we set things up</p>
      </div>
    </div>
  );
};

export default LoadingScreen;