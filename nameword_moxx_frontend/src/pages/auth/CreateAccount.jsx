import AuthNavbar from '../../components/layout/AuthNavbar';
import AuthFooter from '../../components/layout/AuthFooter';
import { TbArrowRight  } from "react-icons/tb";
import { google, telegram } from "../../components/common/icons";
import { FiEye , FiEyeOff  } from "react-icons/fi";
import { useState } from "react";
import { useAuth } from '../../context/AuthContext';
import { useNavigate, Link } from 'react-router';

const CreateAccount = () => {    
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);
    const [formData, setFormData] = useState({
        firstName: '',
        lastName: '',
        email: '',
        password: '',
        confirmPassword: ''
    });
    const [loading, setLoading] = useState(false);
    
    const { register, error, clearError } = useAuth();
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
        
        if (!formData.firstName || !formData.lastName || !formData.email || !formData.password) {
            return;
        }

        if (formData.password !== formData.confirmPassword) {
            alert('Passwords do not match');
            return;
        }

        setLoading(true);
        try {
            const userData = {
                firstName: formData.firstName,
                lastName: formData.lastName,
                email: formData.email,
                password: formData.password
            };
            
            await register(userData);
            // Redirect to home page after successful registration
            navigate('/');
        } catch (error) {
            console.error('Registration failed:', error);
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
                    <h2 className="heading-title">Create Account</h2>
                    <hr className='card-divider my-3' />

                    {/* Error message */}
                    {error && (
                        <div className="mb-4 p-3 bg-red-100 dark:bg-red-900/20 border border-red-300 dark:border-red-700 rounded-md">
                            <p className="text-red-700 dark:text-red-400 text-sm">{error}</p>
                        </div>
                    )}
                    
                    <form onSubmit={handleSubmit}>
                        {/* First Name */}
                        <div className="relative">
                            <input
                                type="text"
                                name="firstName"
                                className="input-field peer"
                                id="firstName"
                                value={formData.firstName}
                                onChange={handleChange}
                                required
                                disabled={loading}
                            />
                            <label
                                htmlFor="firstName"
                                className={`absolute left-5 transition-all font-medium ${formData.firstName ? 'top-2 text-xs text-gray-600' : 'top-4 text-13 text-primary dark:text-gray-500 '} peer-focus:top-2 peer-focus:text-xs peer-focus:text-gray-600 peer-placeholder-shown:text-secondary`}
                            >
                                First Name *
                            </label>
                        </div>

                        {/* Last Name */}
                        <div className="relative">
                            <input
                                type="text"
                                name="lastName"
                                className="input-field peer"
                                id="lastName"
                                value={formData.lastName}
                                onChange={handleChange}
                                required
                                disabled={loading}
                            />
                            <label
                                htmlFor="lastName"
                                className={`absolute left-5 transition-all font-medium ${formData.lastName ? 'top-2 text-xs text-gray-600' : 'top-4 text-13 text-primary dark:text-gray-500 '} peer-focus:top-2 peer-focus:text-xs peer-focus:text-gray-600 peer-placeholder-shown:text-secondary`}
                            >
                                Last Name *
                            </label>
                        </div>

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

                        {/* Confirm Password */}
                        <div className="relative">
                            <input
                                type={showConfirmPassword ? "text" : "password"}
                                name="confirmPassword"
                                className="input-field peer"
                                id="confirmPassword"
                                value={formData.confirmPassword}
                                onChange={handleChange}
                                required
                                disabled={loading}
                            />
                            <button
                                type="button"
                                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                                className="absolute right-5 top-5 text-primary dark:text-gray-500"
                            >
                                {showConfirmPassword ? <FiEyeOff size={18} /> : <FiEye size={18} />}
                            </button>
                            <label
                                htmlFor="confirmPassword"
                                className={`absolute left-5 transition-all font-medium ${formData.confirmPassword ? 'top-2 text-xs text-gray-600' : 'top-4 text-13 text-primary dark:text-gray-500'} peer-focus:top-2 peer-focus:text-xs peer-focus:text-gray-600 peer-placeholder-shown:text-secondary`}
                            >
                                Confirm Password *
                            </label>
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
                            disabled={loading || !formData.firstName || !formData.lastName || !formData.email || !formData.password || !formData.confirmPassword}
                        >
                            {loading ? (
                                <div className="flex items-center justify-center">
                                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                                    Creating Account...
                                </div>
                            ) : (
                                <>
                                    Create Account <TbArrowRight size={18} />
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
                        Already have an account? <Link to="/sign-in" className="text-darkbtn dark:text-gray-200 hover:underline font-medium">Sign In</Link>
                    </p>
                </div>
            </div>

            <AuthFooter />
        </div>
    )
}

export default CreateAccount