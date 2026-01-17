import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Smartphone, Globe } from 'lucide-react';
import './Login.css';

const Login = () => {
    const { loginWithGoogle, currentUser } = useAuth();
    const navigate = useNavigate();

    React.useEffect(() => {
        if (currentUser) {
            navigate('/');
        }
    }, [currentUser, navigate]);

    return (
        <div className="login-container">
            <div className="ambient-glow"></div>

            <div className="content-wrapper">
                {/* Left Side: 3D Animation */}
                <div className="animation-section">
                    <div className="rupee-symbol">₹</div>
                    <div className="orbit-ring ring-1"></div>
                    <div className="orbit-ring ring-2"></div>
                    <div className="orbit-ring ring-3"></div>
                </div>

                {/* Right Side: Glass Login Card */}
                <div className="login-card">
                    <div className="card-header">
                        <h2>Sign Up Account</h2>
                        <p>Join the future of finance today.</p>
                    </div>

                    <div className="input-group">
                        <label className="input-label">Email Address</label>
                        <div style={{ position: 'relative' }}>
                            <input type="email" className="styled-input" placeholder="name@example.com" />
                        </div>
                    </div>

                    <div className="input-group">
                        <label className="input-label">Password</label>
                        <div style={{ position: 'relative' }}>
                            <input type="password" className="styled-input" placeholder="••••••••" />
                        </div>
                    </div>

                    <button className="login-btn" onClick={loginWithGoogle}>
                        Sign Up
                    </button>

                    <div className="social-login">
                        {/* Visual only buttons for design match */}
                        <div className="social-btn"><Globe size={20} /></div>
                        <div className="social-btn"><Smartphone size={20} /></div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Login;
