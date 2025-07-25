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
    
    const { login, error, clearError, loading } = useAuth();
    const navigate = useNavigate();

    const handleSubmit = async (values, { setSubmitting, setFieldError }) => {
        try {
            await login(values);
            // Redirect to home page after successful login
            navigate('/');
        } catch (error) {
            console.error('Login failed:', error);
            
            // Handle specific field errors from backend
            if (error.response?.data?.errors) {
                error.response.data.errors.forEach(err => {
                    setFieldError(err.path, err.msg);
                });
            }
        } finally {
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

                    {/* --- sucess msg --- */}
                    {/* <div className='sucess-card flex flex-col'>
                        <p className='text-base text-primary dark:text-gray-500 font-medium'>
                            You set the new Password!
                        </p>
                        <p className='text-13 text-primary dark:text-gray-500 font-medium'>
                            Please login with your new password.
                        </p>
                    </div> */}

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
                        {({ values, errors, touched, handleChange, handleBlur, isSubmitting, isValid, dirty }) => (
                            <Form className='gap-2.5 flex flex-col w-full'>
                                {/* Email */}
                                <div className={`relative ${errors.email ? "input-error" : ""}`}>
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
                                    <ErrorMessage name="email" component="p" className="text-warning pl-5 text-xs font-medium mt-1" />
                                </div>

                                {/* Password */}
                                <div className={`relative ${errors.password ? "input-error" : ""}`}>
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
                                    <ErrorMessage name="password" component="p" className="text-warning pl-5 text-xs font-medium mt-1" />
                                </div>

                                <button
                                    type="submit"
                                    disabled={!isValid || !dirty || isSubmitting || loading}
                                    className="btn-primary w-full flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                    {loading ? (
                                        <div className="flex items-center gap-2">
                                            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                                            Signing In...
                                        </div>
                                    ) : (
                                        <>
                                            Sign In
                                            <TbArrowRight size={18} />
                                        </>
                                    )}
                                </button>
                            </Form>
                        )}
                    </Formik>

                    <div className="mt-6 text-center">
                        <p className="text-sm text-gray-600 dark:text-gray-400">
                            Don't have an account?{' '}
                            <Link to="/create-account" className="text-primary hover:text-primary-dark font-medium">
                                Create Account
                            </Link>
                        </p>
                        <p className="text-sm text-gray-600 dark:text-gray-400 mt-2">
                            <Link to="/forgot-password" className="text-primary hover:text-primary-dark font-medium">
                                Forgot Password?
                            </Link>
                        </p>
                    </div>
                </div>
            </div>

            <AuthFooter />
        </div>
    );
};

export default SignIn;