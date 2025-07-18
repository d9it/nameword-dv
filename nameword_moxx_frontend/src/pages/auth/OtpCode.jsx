import AuthNavbar from '../../components/layout/AuthNavbar';
import AuthFooter from '../../components/layout/AuthFooter';
import { TbArrowRight  } from "react-icons/tb";
import { useState } from "react";
import { useAuth } from '../../context/AuthContext';
import { useNavigate, Link, useSearchParams } from 'react-router-dom';
import { Formik, Form, Field, ErrorMessage } from 'formik';
import { otpSchema } from '../../utils/validationSchemas';

const OtpCode = () => {    
    const [searchParams] = useSearchParams();
    const [success, setSuccess] = useState(false);
    const [resendLoading, setResendLoading] = useState(false);
    
    const { verifyEmailCode, sendEmailCode, error, clearError, loading } = useAuth();
    const navigate = useNavigate();

    // Get email from URL params
    const email = searchParams.get('email');

    const handleSubmit = async (values, { setSubmitting, setFieldError }) => {
        try {
            await verifyEmailCode({
                email: email || values.email,
                code: values.otp
            });
            setSuccess(true);
            // Redirect to login after a short delay
            setTimeout(() => {
                navigate('/signin');
            }, 3000);
        } catch (error) {
            console.error('OTP verification failed:', error);
            
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

    const handleResendCode = async () => {
        try {
            setResendLoading(true);
            await sendEmailCode(email);
            // Show success message
            alert('Verification code sent successfully!');
        } catch (error) {
            console.error('Failed to resend code:', error);
        } finally {
            setResendLoading(false);
        }
    };

    return (
        <div>
            <AuthNavbar />

            {/* OTP verification */}
            <div className='login-section'>
                <div className='inner-section'>
                    <h2 className="heading-title">Verify Email</h2>
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
                                        Email verified successfully! Redirecting to login...
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
                                    We've sent a verification code to {email || 'your email'}. Please check your inbox and enter the code below.
                                </p>
                            </div>
                        </div>
                    </div>
                    
                    <Formik
                        initialValues={{ 
                            email: email || '', 
                            otp: '' 
                        }}
                        validationSchema={otpSchema}
                        onSubmit={handleSubmit}
                        enableReinitialize
                    >
                        {({ values, errors, touched, handleChange, handleBlur, isSubmitting, isValid, dirty }) => (
                            <Form className='gap-2.5 flex flex-col w-full'>
                                {/* Email (if not provided in URL) */}
                                {!email && (
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
                                )}

                                {/* OTP Code */}
                                <div className={`relative ${errors.otp ? "input-error" : ""}`}>
                                    <Field
                                        type="text"
                                        name="otp"
                                        className={`input-field peer text-center text-lg tracking-widest ${errors.otp && touched.otp ? 'border-red-500 dark:border-red-400' : ''}`}
                                        id="otp"
                                        value={values.otp}
                                        onChange={(e) => {
                                            // Only allow numbers and limit to 6 digits
                                            const value = e.target.value.replace(/\D/g, '').slice(0, 6);
                                            handleChange({
                                                target: {
                                                    name: 'otp',
                                                    value: value
                                                }
                                            });
                                            if (error) clearError();
                                        }}
                                        onBlur={handleBlur}
                                        disabled={loading}
                                        placeholder="000000"
                                        maxLength="6"
                                    />
                                    <label
                                        htmlFor="otp"
                                        className={`absolute left-5 transition-all font-medium ${values.otp ? 'top-2 text-xs text-gray-600' : 'top-4 text-13 text-primary dark:text-gray-500'} peer-focus:top-2 peer-focus:text-xs peer-focus:text-gray-600 peer-placeholder-shown:text-secondary`}
                                    >
                                        Verification Code *
                                    </label>
                                    <ErrorMessage name="otp" component="p" className="text-warning pl-5 text-xs font-medium mt-1" />
                                </div>

                                <button
                                    type="submit"
                                    disabled={!isValid || !dirty || isSubmitting || loading}
                                    className="btn-primary w-full flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                    {loading ? (
                                        <div className="flex items-center gap-2">
                                            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                                            Verifying...
                                        </div>
                                    ) : (
                                        <>
                                            Verify Email
                                            <TbArrowRight size={18} />
                                        </>
                                    )}
                                </button>
                            </Form>
                        )}
                    </Formik>

                    <div className="mt-6 text-center">
                        <p className="text-sm text-gray-600 dark:text-gray-400">
                            Didn't receive the code?{' '}
                            <button
                                onClick={handleResendCode}
                                disabled={resendLoading}
                                className="text-primary hover:text-primary-dark font-medium disabled:opacity-50"
                            >
                                {resendLoading ? 'Sending...' : 'Resend Code'}
                            </button>
                        </p>
                        <p className="text-sm text-gray-600 dark:text-gray-400 mt-2">
                            <Link to="/signin" className="text-primary hover:text-primary-dark font-medium">
                                Back to Sign In
                            </Link>
                        </p>
                    </div>
                </div>
            </div>

            <AuthFooter />
        </div>
    );
};

export default OtpCode;