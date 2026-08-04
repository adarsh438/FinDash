import { Link } from 'react-router-dom';
import { Home, ArrowLeft } from 'lucide-react';
import './NotFound.css';

const NotFound = () => {
    return (
        <div className="not-found-page animate-fade-in">
            <div className="not-found-card">
                <div className="glitch-404">404</div>
                <h2>Page Not Found</h2>
                <p>The financial view or page you're looking for doesn't exist or has been moved.</p>
                <div className="not-found-actions">
                    <Link to="/" className="btn-home">
                        <Home size={16} /> Back to Dashboard
                    </Link>
                    <button className="btn-back" onClick={() => window.history.back()}>
                        <ArrowLeft size={16} /> Go Back
                    </button>
                </div>
            </div>
        </div>
    );
};

export default NotFound;
