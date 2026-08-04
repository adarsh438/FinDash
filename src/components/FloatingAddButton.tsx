import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus } from 'lucide-react';

interface FloatingAddButtonProps {
    onClick: () => void;
}

const FloatingAddButton: React.FC<FloatingAddButtonProps> = ({ onClick }) => {
    const [hovered, setHovered] = useState(false);

    return (
        <div className="fab-container">
            <motion.button
                className="fab-button"
                onClick={onClick}
                onMouseEnter={() => setHovered(true)}
                onMouseLeave={() => setHovered(false)}
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                initial={{ scale: 0, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ type: 'spring', stiffness: 400, damping: 20, delay: 0.3 }}
                aria-label="Add Expense"
            >
                <motion.div
                    animate={{ rotate: hovered ? 90 : 0 }}
                    transition={{ duration: 0.2 }}
                >
                    <Plus size={24} strokeWidth={2.5} />
                </motion.div>
            </motion.button>

            <AnimatePresence>
                {hovered && (
                    <motion.div
                        className="fab-tooltip"
                        initial={{ opacity: 0, x: 8 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: 8 }}
                        transition={{ duration: 0.15 }}
                    >
                        Add Expense
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
};

export default FloatingAddButton;
