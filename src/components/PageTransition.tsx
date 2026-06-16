interface PageTransitionProps {
    children: React.ReactNode;
}

// Transición de entrada con CSS puro (clase .page-transition en index.css).
// Antes usaba framer-motion, pero eso arrastraba ~122 KB al bundle inicial
// porque Layout monta este componente de forma eager. La animación es la misma:
// fade + slide-up al montar.
const PageTransition: React.FC<PageTransitionProps> = ({ children }) => {
    return <div className="page-transition">{children}</div>;
};

export default PageTransition;
