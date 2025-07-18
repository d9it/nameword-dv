import AuthNavbar from '../../components/layout/AuthNavbar';
import AuthFooter from '../../components/layout/AuthFooter';
import { TbArrowRight  } from "react-icons/tb";
import { useState } from "react";
import { useAuth } from '../../context/AuthContext';
import { useNavigate, Link } from 'react-router-dom';
import { Formik, Form, Field, ErrorMessage } from 'formik';
import * as Yup from 'yup';

const forgotPasswordSchema = Yup.object().shape({
  email: Yup.string()
    .email('Please enter a valid email address')
    .required('Email is required'),
});

const ForgotPassword = () => {    
    const [success, setSuccess] = useState(false);
    
    const { sendEmailCode, error, clearError, loading } = useAuth();
    const navigate = useNavigate();

    const handleSubmit = async (values, { setSubmitting, setFieldError }) => {
        try {
            await sendEmailCode(values.email);
            setSuccess(true);
        } catch (error) {
            console.error('Failed to send reset email:', error);
            
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

            {/* forgot password */}
            <div className='login-section'>
                <div className='inner-section'>
                    <h2 className="heading-title">Forgot Password</h2>
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
                                        Password reset link sent successfully! Please check your email.
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

                    {/* Info message */}
                    <div className="mb-4 p-4 bg-blue-50 dark:bg-blue-900/30 border border-blue-200 dark:border-blue-800 rounded-lg shadow-sm">
                        <div className="flex items-start">
                            <div className="flex-shrink-0">
                                <svg className="h-5 w-5 text-blue-400" viewBox="0 0 20 20" fill="currentColor">
                                    <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                                </svg>
                            </div>
                            <div className="ml-3">
                                <p className="text-sm text-blue-700 dark:text-blue-300 font-medium">
                                    Enter your email address and we'll send you a link to reset your password.
                                </p>
                            </div>
                        </div>
                    </div>
                    
                    <Formik
                        initialValues={{ email: '' }}
                        validationSchema={forgotPasswordSchema}
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
                                        disabled={loading || success}
                                    />
                                    <label
                                        htmlFor="email"
                                        className={`absolute left-5 transition-all font-medium ${values.email ? 'top-2 text-xs text-gray-600' : 'top-4 text-13 text-primary dark:text-gray-500 '} peer-focus:top-2 peer-focus:text-xs peer-focus:text-gray-600 peer-placeholder-shown:text-secondary`}
                                    >
                                        Email Address *
                                    </label>
                                    <ErrorMessage name="email" component="p" className="text-warning pl-5 text-xs font-medium mt-1" />
                                </div>

                                <button
                                    type="submit"
                                    disabled={!isValid || !dirty || isSubmitting || loading || success}
                                    className="btn-primary w-full flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                    {loading ? (
                                        <div className="flex items-center gap-2">
                                            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                                            Sending Reset Link...
                                        </div>
                                    ) : (
                                        <>
                                            Send Reset Link
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

export default ForgotPassword; 