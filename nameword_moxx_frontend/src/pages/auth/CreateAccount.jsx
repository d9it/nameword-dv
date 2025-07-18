import AuthNavbar from '../../components/layout/AuthNavbar';
import AuthFooter from '../../components/layout/AuthFooter';
import { TbArrowRight  } from "react-icons/tb";
import { google, telegram } from "../../components/common/icons";
import { FiEye , FiEyeOff  } from "react-icons/fi";
import { useState } from "react";
import { useAuth } from '../../context/AuthContext';
import { useNavigate, Link } from 'react-router-dom';
import { Formik, Form, Field, ErrorMessage } from 'formik';
import { registerSchema } from '../../utils/validationSchemas';
import { MdCheck } from "react-icons/md";
import { IoClose } from "react-icons/io5";

const CreateAccount = () => {    
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);
    const [profileImg, setProfileImg] = useState(null);
    
    const { register, error, clearError, loading } = useAuth();
    const navigate = useNavigate();

    const handleSubmit = async (values, { setSubmitting, setFieldError }) => {
        try {
            const userData = {
                firstName: values.firstName,
                lastName: values.lastName,
                email: values.email,
                password: values.password,
                name: `${values.firstName} ${values.lastName}`,
                ...(profileImg && { profileImg })
            };
            
            await register(userData);
            // Redirect to home page after successful registration
            navigate('/');
        } catch (error) {
            console.error('Registration failed:', error);
            
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

    const handleProfileImageChange = (event) => {
        const file = event.target.files[0];
        if (file) {
            setProfileImg(file);
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
                            firstName: '', 
                            lastName: '', 
                            email: '', 
                            password: '', 
                            confirmPassword: '' 
                        }}
                        validationSchema={registerSchema}
                        onSubmit={handleSubmit}
                    >
                        {({ values, errors, touched, handleChange, handleBlur, isSubmitting, isValid, dirty }) => (
                            <Form className='gap-2.5 flex flex-col w-full'>
                                {/* First Name */}
                                <div className={`relative ${errors.firstName ? "input-error" : ""}`}>
                                    <Field
                                        type="text"
                                        name="firstName"
                                        className={`input-field peer ${errors.firstName && touched.firstName ? 'border-red-500 dark:border-red-400' : ''}`}
                                        id="firstName"
                                        value={values.firstName}
                                        onChange={(e) => {
                                            handleChange(e);
                                            if (error) clearError();
                                        }}
                                        onBlur={handleBlur}
                                        disabled={loading}
                                    />
                                    <label
                                        htmlFor="firstName"
                                        className={`absolute left-5 transition-all font-medium ${values.firstName ? 'top-2 text-xs text-gray-600' : 'top-4 text-13 text-primary dark:text-gray-500 '} peer-focus:top-2 peer-focus:text-xs peer-focus:text-gray-600 peer-placeholder-shown:text-secondary`}
                                    >
                                        First Name *
                                    </label>
                                    <ErrorMessage name="firstName" component="p" className="text-warning pl-5 text-xs font-medium mt-1" />
                                </div>

                                {/* Last Name */}
                                <div className={`relative ${errors.lastName ? "input-error" : ""}`}>
                                    <Field
                                        type="text"
                                        name="lastName"
                                        className={`input-field peer ${errors.lastName && touched.lastName ? 'border-red-500 dark:border-red-400' : ''}`}
                                        id="lastName"
                                        value={values.lastName}
                                        onChange={(e) => {
                                            handleChange(e);
                                            if (error) clearError();
                                        }}
                                        onBlur={handleBlur}
                                        disabled={loading}
                                    />
                                    <label
                                        htmlFor="lastName"
                                        className={`absolute left-5 transition-all font-medium ${values.lastName ? 'top-2 text-xs text-gray-600' : 'top-4 text-13 text-primary dark:text-gray-500 '} peer-focus:top-2 peer-focus:text-xs peer-focus:text-gray-600 peer-placeholder-shown:text-secondary`}
                                    >
                                        Last Name *
                                    </label>
                                    <ErrorMessage name="lastName" component="p" className="text-warning pl-5 text-xs font-medium mt-1" />
                                </div>

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

                                {/* Profile Image */}
                                <div className="relative">
                                    <input
                                        type="file"
                                        accept="image/*"
                                        onChange={handleProfileImageChange}
                                        className="hidden"
                                        id="profileImg"
                                        disabled={loading}
                                    />
                                    <label
                                        htmlFor="profileImg"
                                        className="block w-full p-4 border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg text-center cursor-pointer hover:border-gray-400 dark:hover:border-gray-500 transition-colors"
                                    >
                                        <div className="flex flex-col items-center">
                                            <svg className="w-8 h-8 text-gray-400 mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                                            </svg>
                                            <span className="text-sm text-gray-600 dark:text-gray-400">
                                                {profileImg ? profileImg.name : 'Upload Profile Image (Optional)'}
                                            </span>
                                        </div>
                                    </label>
                                </div>

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

                                {(errors.password || values.password) &&
                                    <div>
                                        {/* strong password */}
                                         {!errors.password && values.password &&
                                        <div className="border border-stokecolor rounded p-4 space-y-1.5 w-full">
                                            <div className="flex items-center gap-2">
                                                <div className="flex gap-1">
                                                    <div className="w-5 h-1 rounded-full bg-tealdark" />
                                                    <div className="w-5 h-1 rounded-full bg-tealdark" />
                                                    <div className="w-5 h-1 rounded-full bg-tealdark" />
                                                    <div className="w-5 h-1 rounded-full bg-tealdark" />
                                                    <div className="w-5 h-1 rounded-full bg-tealdark" />
                                                    <div className="w-5 h-1 rounded-full bg-tealdark" />
                                                    <div className="w-5 h-1 rounded-full bg-tealdark" />
                                                </div>
                                                <span className="text-tealdark font-medium text-13">Strong</span>
                                            </div>
                                            <ul className="space-y-1">
                                                <li className="flex items-start gap-1.5">
                                                    <span className="text-primary dark:text-gray-500">
                                                        <IoClose className='w-4 h-4 flex-none' />
                                                    </span>
                                                    <span className="text-xs text-primary dark:text-gray-500 font-medium line-through">
                                                        The password must contain at least 8 characters.
                                                    </span>
                                                </li>
                                                <li className="flex items-start gap-1.5">
                                                    <span className="text-primary dark:text-gray-500">
                                                        <IoClose className='w-4 h-4 flex-none' />
                                                    </span>
                                                    <span className="text-xs text-primary dark:text-gray-500 font-medium line-through">
                                                        There should be at least one special symbol
                                                    </span>
                                                </li>
                                            </ul>
                                        </div>}

                                        {/* weak password */}
                                        {errors.password && values.password &&
                                        <div className="border border-stokecolor rounded p-4 space-y-1.5 w-full">
                                            <div className="flex items-center gap-2">
                                                <div className="flex gap-1">
                                                    <div className="w-5 h-1 rounded-full bg-warning" />
                                                    <div className="w-5 h-1 rounded-full bg-warning" />
                                                    <div className="w-5 h-1 rounded-full bg-warning" />
                                                    <div className="w-5 h-1 rounded-full bg-lightgray" />
                                                    <div className="w-5 h-1 rounded-full bg-lightgray" />
                                                    <div className="w-5 h-1 rounded-full bg-lightgray" />
                                                    <div className="w-5 h-1 rounded-full bg-lightgray" />
                                                </div>
                                                <span className="text-warning font-medium text-13">Weak</span>
                                            </div>

                                            <ul className="space-y-1">
                                                <li className="flex items-start gap-1.5">
                                                    <span className="text-primary dark:text-gray-500">
                                                        <MdCheck className='w-4 h-4 flex-none' />
                                                    </span>
                                                    <span className="text-xs text-primary dark:text-gray-500 font-medium">
                                                        The password must contain at least 8 characters.
                                                    </span>
                                                </li>
                                                <li className="flex items-start gap-1.5">
                                                    <span className="text-primary dark:text-gray-500">
                                                        <MdCheck className='w-4 h-4 flex-none' />
                                                    </span>
                                                    <span className="text-xs text-primary dark:text-gray-500 font-medium">
                                                        There should be at least one special symbol
                                                    </span>
                                                </li>
                                            </ul>
                                        </div>}
                                    </div>
                                }

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
                                        Confirm Password *
                                    </label>
                                    <ErrorMessage name="confirmPassword" component="p" className="text-warning pl-5 text-xs font-medium mt-1" />
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
                                    disabled={!isValid || !dirty || isSubmitting || loading}
                                    className="btn-primary w-full flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                    {loading ? (
                                        <div className="flex items-center gap-2">
                                            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                                            Creating Account...
                                        </div>
                                    ) : (
                                        <>
                                            Create Account
                                            <TbArrowRight size={18} />
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
                        Already have an account? <Link to="/sign-in" className="text-darkbtn dark:text-gray-200 hover:underline font-medium">Sign In</Link>
                    </p>
                </div>
            </div>

            <AuthFooter />
        </div>
    )
}

export default CreateAccount