import { useState } from "react";
import { motion } from "framer-motion";
import { Rocket } from "lucide-react";

function App() {
  const [count, setCount] = useState(0);

  return (
    <div className="min-h-screen bg-secondary flex flex-col items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center"
      >
        <Rocket className="w-16 h-16 text-primary mb-6 mx-auto" />
        <h1 className="text-4xl font-bold text-white mb-4">
          Elivex Project Ready
        </h1>
        <p className="text-gray-400 mb-8 max-w-md mx-auto">
          Vite + React 19 + Tailwind CSS v4 + Framer Motion
        </p>
        
        <button
          onClick={() => setCount((count) => count + 1)}
          className="bg-primary text-secondary font-bold py-3 px-8 rounded-full hover:opacity-90 transition-opacity"
        >
          Counter is {count}
        </button>
      </motion.div>
    </div>
  );
}

export default App;
