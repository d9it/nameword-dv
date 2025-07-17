import AuthNavbar from '../../components/layout/AuthNavbar';
import AuthFooter from '../../components/layout/AuthFooter';
import { TbArrowRight  } from "react-icons/tb";
import { google, telegram } from "../../components/common/icons";
import { FiEye , FiEyeOff  } from "react-icons/fi";
import { useState } from "react";
import { useAuth } from '../../context/AuthContext';
import { useNavigate, Link } from 'react-router';

const SignIn = () => {    
    const [showPassword, setShowPassword] = useState(false);
    const [formData, setFormData] = useState({
        email: '',
        password: ''
    });
    const [loading, setLoading] = useState(false);
    
    const { login, error, clearError } = useAuth();
    const navigate = useNavigate();

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
        // Clear error when user starts typing
        if (error) clearError();
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        
        if (!formData.email || !formData.password) {
            return;
        }

        setLoading(true);
        try {
            await login(formData);
            // Redirect to home page after successful login
            navigate('/');
        } catch (error) {
            console.error('Login failed:', error);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div> 
            <AuthNavbar />
            
            {/* create account */}
            <div className='login-section'>
                <div className='inner-section'>
                    <h2 className="heading-title">Sign in</h2>
                    <hr className='card-divider my-3' />

                    {/* Error message */}
                    {error && (
                        <div className="mb-4 p-3 bg-red-100 dark:bg-red-900/20 border border-red-300 dark:border-red-700 rounded-md">
                            <p className="text-red-700 dark:text-red-400 text-sm">{error}</p>
                        </div>
                    )}
                    
                    <form onSubmit={handleSubmit}>
                        {/* Email */}
                        <div className="relative">
                            <input
                                type="email"
                                name="email"
                                className="input-field peer"
                                id="email"
                                value={formData.email}
                                onChange={handleChange}
                                required
                                disabled={loading}
                            />
                            <label
                                htmlFor="email"
                                className={`absolute left-5 transition-all font-medium ${formData.email ? 'top-2 text-xs text-gray-600' : 'top-4 text-13 text-primary dark:text-gray-500 '} peer-focus:top-2 peer-focus:text-xs peer-focus:text-gray-600 peer-placeholder-shown:text-secondary`}
                            >
                                Email Address *
                            </label>
                        </div>

                        {/* Password */}
                        <div className="relative">
                            <input
                                type={showPassword ? "text" : "password"}
                                name="password"
                                className="input-field peer"
                                id="password"
                                value={formData.password}
                                onChange={handleChange}
                                required
                                disabled={loading}
                            />
                            <button
                                type="button"
                                onClick={() => setShowPassword(!showPassword)}
                                className="absolute right-5 top-5 text-primary dark:text-gray-500"
                            >
                                {showPassword ? <FiEyeOff size={18} /> : <FiEye size={18} />}
                            </button>
                            <label
                                htmlFor="password"
                                className={`absolute left-5 transition-all font-medium ${formData.password ? 'top-2 text-xs text-gray-600' : 'top-4 text-13 text-primary dark:text-gray-500'} peer-focus:top-2 peer-focus:text-xs peer-focus:text-gray-600 peer-placeholder-shown:text-secondary`}
                            >
                                Password *
                            </label>
                        </div>
                        
                        <div className='text-right'>
                            <Link to='/reset-password' className='text-darkbtn dark:text-gray-200 hover:underline text-13 font-medium' >Forgot Password?</Link>
                        </div>
                        
                        {/* Terms */}
                        <div>
                            <p className="text-13 text-primary dark:text-gray-500 font-medium mb-0">By clicking button below you agree with our</p>
                            <p className='text-13 text-primary dark:text-gray-500 font-medium'>
                                <a href="#" className="text-darkbtn dark:text-gray-200 hover:underline">Terms of Service</a>
                                <span className='mx-1'>and</span>
                                <a href="#" className="text-darkbtn dark:text-gray-200 hover:underline">Privacy Policy</a>
                            </p>
                        </div>

                        {/* Submit Button */}
                        <button 
                            type="submit"
                            className='add-to-cart max-w-full'
                            disabled={loading || !formData.email || !formData.password}
                        >
                            {loading ? (
                                <div className="flex items-center justify-center">
                                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                                    Signing In...
                                </div>
                            ) : (
                                <>
                                    Login <TbArrowRight size={18} />
                                </>
                            )}
                        </button>
                    </form>

                    {/* Divider */}
                    <div className="flex items-center my-2">
                        <span className="mx-auto text-sm text-secondary">or</span>
                    </div>

                    {/* Social Buttons */}
                    <button className="btn-outline max-w-full" disabled>
                        <img src={google} alt="Google" className="w-5 h-5" />
                        Continue with Google
                    </button>

                    <button className="btn-outline max-w-full" disabled>
                        <img src={telegram} alt="Telegram" className="w-5 h-5" />
                        Continue with Telegram
                    </button>

                    {/* Login */}
                    <p className="text-13 text-primary dark:text-gray-500 font-medium text-center mt-3">
                        Don't have an account? <Link to="/create-account" className="text-darkbtn dark:text-gray-200 hover:underline font-medium">Create</Link>
                    </p>
                </div>
            </div>

            <AuthFooter />
        </div>
    )
}

export default SignIn