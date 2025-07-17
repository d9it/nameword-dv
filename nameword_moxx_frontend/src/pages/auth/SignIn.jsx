import AuthNavbar from '../../components/layout/AuthNavbar';
import AuthFooter from '../../components/layout/AuthFooter';
import { TbArrowRight  } from "react-icons/tb";
import { google, telegram } from "../../components/common/icons";
import { FiEye , FiEyeOff  } from "react-icons/fi";
import { useState } from "react";
import { useAuth } from '../../context/AuthContext';
import { useNavigate, Link } from 'react-router-dom';
import { Formik, Form, Field, ErrorMessage } from 'formik';
import { loginSchema } from '../../utils/validationSchemas';

const SignIn = () => {    
    const [showPassword, setShowPassword] = useState(false);
    const [loading, setLoading] = useState(false);
    
    const { login, error, clearError } = useAuth();
    const navigate = useNavigate();

    const handleSubmit = async (values, { setSubmitting }) => {
        setLoading(true);
        try {
            await login(values);
            // Redirect to home page after successful login
            navigate('/');
        } catch (error) {
            console.error('Login failed:', error);
        } finally {
            setLoading(false);
            setSubmitting(false);
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
                        <div className="mb-4 p-4 bg-red-50 dark:bg-red-900/30 border border-red-200 dark:border-red-800 rounded-lg shadow-sm">
                            <div className="flex items-start">
                                <div className="flex-shrink-0">
                                    <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
                                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                                    </svg>
                                </div>
                                <div className="ml-3">
                                    <p className="text-sm text-red-700 dark:text-red-300 font-medium">{error}</p>
                                </div>
                            </div>
                        </div>
                    )}
                    
                    <Formik
                        initialValues={{ email: '', password: '' }}
                        validationSchema={loginSchema}
                        onSubmit={handleSubmit}
                    >
                        {({ values, errors, touched, handleChange, handleBlur, isSubmitting }) => (
                            <Form>
                                {/* Email */}
                                <div className="relative">
                                    <Field
                                        type="email"
                                        name="email"
                                        className={`input-field peer ${errors.email && touched.email ? 'border-red-500 dark:border-red-400' : ''}`}
                                        id="email"
                                        value={values.email}
                                        onChange={(e) => {
                                            handleChange(e);
                                            if (error) clearError();
                                        }}
                                        onBlur={handleBlur}
                                        disabled={loading}
                                    />
                                    <label
                                        htmlFor="email"
                                        className={`absolute left-5 transition-all font-medium ${values.email ? 'top-2 text-xs text-gray-600' : 'top-4 text-13 text-primary dark:text-gray-500 '} peer-focus:top-2 peer-focus:text-xs peer-focus:text-gray-600 peer-placeholder-shown:text-secondary`}
                                    >
                                        Email Address *
                                    </label>
                                    <ErrorMessage name="email" component="p" className="mt-1 text-xs text-red-600 dark:text-red-400" />
                                </div>

                                {/* Password */}
                                <div className="relative">
                                    <Field
                                        type={showPassword ? "text" : "password"}
                                        name="password"
                                        className={`input-field peer ${errors.password && touched.password ? 'border-red-500 dark:border-red-400' : ''}`}
                                        id="password"
                                        value={values.password}
                                        onChange={(e) => {
                                            handleChange(e);
                                            if (error) clearError();
                                        }}
                                        onBlur={handleBlur}
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
                                        className={`absolute left-5 transition-all font-medium ${values.password ? 'top-2 text-xs text-gray-600' : 'top-4 text-13 text-primary dark:text-gray-500'} peer-focus:top-2 peer-focus:text-xs peer-focus:text-gray-600 peer-placeholder-shown:text-secondary`}
                                    >
                                        Password *
                                    </label>
                                    <ErrorMessage name="password" component="p" className="mt-1 text-xs text-red-600 dark:text-red-400" />
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
                                    disabled={loading || isSubmitting || !values.email || !values.password}
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
                            </Form>
                        )}
                    </Formik>

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