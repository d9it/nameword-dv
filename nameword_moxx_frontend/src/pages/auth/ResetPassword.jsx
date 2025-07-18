import AuthNavbar from '../../components/layout/AuthNavbar';
import AuthFooter from '../../components/layout/AuthFooter';
import { TbArrowRight  } from "react-icons/tb";
import { FiEye , FiEyeOff  } from "react-icons/fi";
import { useState } from "react";
import { useAuth } from '../../context/AuthContext';
import { useNavigate, Link, useSearchParams } from 'react-router-dom';
import { Formik, Form, Field, ErrorMessage } from 'formik';
import * as Yup from 'yup';

const resetPasswordSchema = Yup.object().shape({
  email: Yup.string()
    .email('Please enter a valid email address')
    .required('Email is required'),
  token: Yup.string()
    .required('Reset token is required'),
  password: Yup.string()
    .min(8, 'Password must be at least 8 characters')
    .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/, 'Password must contain at least one uppercase letter, one lowercase letter, and one number')
    .required('Password is required'),
  confirmPassword: Yup.string()
    .oneOf([Yup.ref('password'), null], 'Passwords must match')
    .required('Please confirm your password'),
});

const ResetPassword = () => {    
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);
    const [searchParams] = useSearchParams();
    const [success, setSuccess] = useState(false);
    
    const { resetPassword, error, clearError, loading } = useAuth();
    const navigate = useNavigate();

    // Get token and email from URL params
    const token = searchParams.get('token');
    const email = searchParams.get('email');

    const handleSubmit = async (values, { setSubmitting, setFieldError }) => {
        try {
            await resetPassword(values);
            setSuccess(true);
            // Redirect to login after a short delay
            setTimeout(() => {
                navigate('/signin');
            }, 3000);
        } catch (error) {
            console.error('Password reset failed:', error);
            
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

            {/* reset password */}
            <div className='login-section'>
                <div className='inner-section'>
                    <h2 className="heading-title">Reset Password</h2>
                    <hr className='card-divider my-3' />

                    {/* Success message */}
                    {success && (
                        <div className="mb-4 p-4 bg-green-50 dark:bg-green-900/30 border border-green-200 dark:border-green-800 rounded-lg shadow-sm">
                            <div className="flex items-start">
                                <div className="flex-shrink-0">
                                    <svg className="h-5 w-5 text-green-400" viewBox="0 0 20 20" fill="currentColor">
                                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                                    </svg>
                                </div>
                                <div className="ml-3">
                                    <p className="text-sm text-green-700 dark:text-green-300 font-medium">
                                        Password reset successfully! Redirecting to login...
                                    </p>
                                </div>
                            </div>
                        </div>
                    )}

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
                        initialValues={{ 
                            email: email || '', 
                            token: token || '', 
                            password: '', 
                            confirmPassword: '' 
                        }}
                        validationSchema={resetPasswordSchema}
                        onSubmit={handleSubmit}
                        enableReinitialize
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
                                        disabled={loading || !!email}
                                    />
                                    <label
                                        htmlFor="email"
                                        className={`absolute left-5 transition-all font-medium ${values.email ? 'top-2 text-xs text-gray-600' : 'top-4 text-13 text-primary dark:text-gray-500 '} peer-focus:top-2 peer-focus:text-xs peer-focus:text-gray-600 peer-placeholder-shown:text-secondary`}
                                    >
                                        Email Address *
                                    </label>
                                    <ErrorMessage name="email" component="p" className="text-warning pl-5 text-xs font-medium mt-1" />
                                </div>

                                {/* Token */}
                                <div className={`relative ${errors.token ? "input-error" : ""}`}>
                                    <Field
                                        type="text"
                                        name="token"
                                        className={`input-field peer ${errors.token && touched.token ? 'border-red-500 dark:border-red-400' : ''}`}
                                        id="token"
                                        value={values.token}
                                        onChange={(e) => {
                                            handleChange(e);
                                            if (error) clearError();
                                        }}
                                        onBlur={handleBlur}
                                        disabled={loading || !!token}
                                    />
                                    <label
                                        htmlFor="token"
                                        className={`absolute left-5 transition-all font-medium ${values.token ? 'top-2 text-xs text-gray-600' : 'top-4 text-13 text-primary dark:text-gray-500 '} peer-focus:top-2 peer-focus:text-xs peer-focus:text-gray-600 peer-placeholder-shown:text-secondary`}
                                    >
                                        Reset Token *
                                    </label>
                                    <ErrorMessage name="token" component="p" className="text-warning pl-5 text-xs font-medium mt-1" />
                                </div>

                                {/* New Password */}
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
                                        New Password *
                                    </label>
                                    <ErrorMessage name="password" component="p" className="text-warning pl-5 text-xs font-medium mt-1" />
                                </div>

                                {/* Confirm Password */}
                                <div className={`relative ${errors.confirmPassword ? "input-error" : ""}`}>
                                    <Field
                                        type={showConfirmPassword ? "text" : "password"}
                                        name="confirmPassword"
                                        className={`input-field peer ${errors.confirmPassword && touched.confirmPassword ? 'border-red-500 dark:border-red-400' : ''}`}
                                        id="confirmPassword"
                                        value={values.confirmPassword}
                                        onChange={(e) => {
                                            handleChange(e);
                                            if (error) clearError();
                                        }}
                                        onBlur={handleBlur}
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
                                        className={`absolute left-5 transition-all font-medium ${values.confirmPassword ? 'top-2 text-xs text-gray-600' : 'top-4 text-13 text-primary dark:text-gray-500'} peer-focus:top-2 peer-focus:text-xs peer-focus:text-gray-600 peer-placeholder-shown:text-secondary`}
                                    >
                                        Confirm New Password *
                                    </label>
                                    <ErrorMessage name="confirmPassword" component="p" className="text-warning pl-5 text-xs font-medium mt-1" />
                                </div>

                                <button
                                    type="submit"
                                    disabled={!isValid || !dirty || isSubmitting || loading}
                                    className="btn-primary w-full flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                    {loading ? (
                                        <div className="flex items-center gap-2">
                                            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                                            Resetting Password...
                                        </div>
                                    ) : (
                                        <>
                                            Reset Password
                                            <TbArrowRight size={18} />
                                        </>
                                    )}
                                </button>
                            </Form>
                        )}
                    </Formik>

                    <div className="mt-6 text-center">
                        <p className="text-sm text-gray-600 dark:text-gray-400">
                            Remember your password?{' '}
                            <Link to="/signin" className="text-primary hover:text-primary-dark font-medium">
                                Sign In
                            </Link>
                        </p>
                    </div>
                </div>
            </div>

            <AuthFooter />
        </div>
    );
};

export default ResetPassword;