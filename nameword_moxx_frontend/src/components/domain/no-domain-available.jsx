import { RiGlobalLine } from "react-icons/ri";
import { FiInfo } from "react-icons/fi";
import { MdCheck } from "react-icons/md";
import { cart } from "../common/icons";
import { NavLink } from "react-router";

const noDomainAvailable = ({ domainName = 'apple.com' }) => {
    return (
        <div className='max-w-5xl mx-auto'>
            {/* search domain card */}
            <div className='grid md:grid-cols-2 gap-5'>
                {/* card 1 */}
                <div className='domain-card no-available md:mb-5'>
                    <div className='flex items-center justify-between gap-3'>
                        <h2 className='flex flex-wrap items-center card-title'>
                            <RiGlobalLine className='mr-1.5 text-lg' />
                            <span className='text-primary dark:text-gray-500'>{domainName.split('.')[0]}</span>
                            <span className='text-darkbtn dark:text-white'>.{domainName.split('.')[1]}</span>
                        </h2>
                        <button className='btn-teal'>Domain Taken</button>
                    </div>
                </div>

                {/* card 1 */}
                <div className='domain-card md:mb-5'>
                    <div className='flex items-center justify-between gap-3'>
                        <h2 className='flex flex-wrap items-center card-title'>
                            <RiGlobalLine className='mr-1.5 text-lg' />
                            <span className='text-primary dark:text-gray-500'>apple</span>
                            <span className='text-darkbtn dark:text-white'>.kitchen</span>
                        </h2>
                        <button className='btn-teal'>Best Alternative</button>
                    </div>

                    <hr className='card-divider my-6' />

                    <div className='text-left space-y-2'>
                        <p className='flex text-primary dark:text-gray-500 text-base font-medium gap-1.5 items-center'>For the first year <FiInfo /></p>
                        <p className='price-tag'>$9.99 <span>$21.99</span></p>
                        <span className='save-lable'>Save 15%</span>
                    </div>

                    <div className='flex justify-start mt-5'>
                        <NavLink to='/add-to-cart' className='add-to-cart'>
                            <img src={cart} alt="add-to-cart" title="" /> Add to Cart
                        </NavLink>
                    </div>

                    <hr className='card-divider my-6' />

                    <div className='flex flex-col w-full gap-4'>
                        <p className='flex items-center gap-2 text-left text-primary dark:text-gray-400 text-sm font-medium'>
                            <MdCheck className='w-5 h-5 flex-none' />
                            The most popular .kitchen domains are usually already taken, so you might want to explore other options.
                        </p>
                        <p className='flex items-center gap-2 text-left text-primary dark:text-gray-400 text-sm font-medium'>
                            <MdCheck className='w-5 h-5 flex-none' />
                            Perfect pick for a creative, business or personal project that stands out.
                        </p>
                    </div>
                </div>
            </div>
        </div>
    )
}

export default noDomainAvailable