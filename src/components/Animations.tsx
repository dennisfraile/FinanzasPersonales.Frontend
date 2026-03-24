import { motion } from 'framer-motion';
import confetti from 'canvas-confetti';

/**
 * Fires confetti celebration animation
 */
export function fireConfetti() {
    confetti({
        particleCount: 100,
        spread: 70,
        origin: { y: 0.6 },
        colors: ['#7c3aed', '#10b981', '#f59e0b', '#3b82f6', '#ef4444'],
    });
}

/**
 * Stagger container - children animate in sequence
 */
export const StaggerList: React.FC<{ children: React.ReactNode; className?: string }> = ({ children, className }) => {
    return (
        <motion.div
            className={className}
            initial="hidden"
            animate="visible"
            variants={{
                hidden: {},
                visible: {
                    transition: {
                        staggerChildren: 0.05,
                    },
                },
            }}
        >
            {children}
        </motion.div>
    );
};

/**
 * Stagger item - fades in and slides up
 */
export const StaggerItem: React.FC<{ children: React.ReactNode; className?: string }> = ({ children, className }) => {
    return (
        <motion.div
            className={className}
            variants={{
                hidden: { opacity: 0, y: 10 },
                visible: { opacity: 1, y: 0, transition: { duration: 0.2 } },
            }}
        >
            {children}
        </motion.div>
    );
};

/**
 * Scale pop - element scales up on mount
 */
export const ScalePop: React.FC<{ children: React.ReactNode; className?: string }> = ({ children, className }) => {
    return (
        <motion.div
            className={className}
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ type: 'spring', stiffness: 300, damping: 20 }}
        >
            {children}
        </motion.div>
    );
};

/**
 * Slide in from right
 */
export const SlideIn: React.FC<{ children: React.ReactNode; className?: string }> = ({ children, className }) => {
    return (
        <motion.div
            className={className}
            initial={{ x: 20, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            transition={{ duration: 0.2 }}
        >
            {children}
        </motion.div>
    );
};
