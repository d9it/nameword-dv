import AuthNavbar from '../../components/layout/AuthNavbar';
import AuthFooter from '../../components/layout/AuthFooter';
import { TbArrowRight  } from "react-icons/tb";
import { useState } from "react";

const ChangeEmail = () => {   
    const [email, setEmail] = useState(''); 
    return (
        <div> 
            <AuthNavbar />
            
            {/* create account */}
            <div className='login-section'>
                <div className='inner-section'>
                    <h2 className="heading-title">Enter your code</h2>
                    <hr className='card-divider my-3' />
                    
                    {/*----- enter username or email ----------*/}
                    <div className='flex flex-col gap-2.5'>
                        <div className="relative">
                            <input
                                type="text"
                                className="input-field peer"
                                id="email"
                                value={email}
                                onChange={e => setEmail(e.target.value)}
                            />
                            <label
                                htmlFor="email"
                                className={`absolute left-5 transition-all font-medium ${email ? 'top-2 text-xs text-gray-600' : 'top-4 text-13 text-primary dark:text-gray-500'} peer-focus:top-2 peer-focus:text-xs peer-focus:text-gray-600 peer-placeholder-shown:text-secondary`}
                            >
                                Email *
                            </label>
                        </div>

                        <a href='#' className='add-to-cart max-w-full'>
                            Send me the code <TbArrowRight size={18} />
                        </a>

                        <div className="text-center mt-3">
                            <a href="/otp-code" className="text-13 text-darkbtn dark:text-gray-200 hover:underline font-medium">Back</a>
                        </div>
                    </div>
                </div>
            </div>

            <AuthFooter />
        </div>
    )
}

export default ChangeEmail