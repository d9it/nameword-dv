import { RiGlobalLine } from "react-icons/ri";
import { FiInfo } from "react-icons/fi";
import { MdCheck } from "react-icons/md";
import { cart } from "../common/icons";
import { TbArrowRight } from "react-icons/tb";
import { NavLink, useMatch } from "react-router";
import { useAuth } from "../../hooks/useAuth";


const searchDomain = ({ domainData, domainName = 'apple.kitchen' }) => {

    const isDomainRouteMatch = useMatch("/domain");
    const isAddToCartRouteMatch = useMatch("/add-to-cart");

    const { user } = useAuth();
    return (
        <div className='max-w-5xl mx-auto'>
            {/* search domain card */}
            <div className='grid md:grid-cols-2 gap-5'>
                {/* card 1 */}
                <div className='domain-card md:mb-5'>
                    <div className='flex items-center justify-between gap-3'>
                        <h2 className='flex flex-wrap items-center card-title'>
                            <RiGlobalLine className='mr-1.5 text-lg' />
                            <span className='text-primary dark:text-gray-500'>{domainName.split('.')[0]}</span>
                            <span className='text-darkbtn dark:text-white'>.{domainName.split('.')[1]}</span>
                        </h2>
                        <button className='btn-teal'>Exact match</button>
                    </div>

                    <hr className='card-divider my-6' />

                    <div className='text-left space-y-2'>
                        <p className='flex text-primary dark:text-gray-500 text-base font-medium gap-1.5 items-center'>For the first year <FiInfo /></p>
                        <p className='price-tag'>
                            ${domainData?.registrationFee || '9.99'} 
                            <span>${domainData?.renewalfee || '21.99'}</span>
                        </p>
                        <span className='save-lable'>Save 15%</span>
                    </div>

                    <div className='flex justify-start mt-5'>
                        {isDomainRouteMatch &&
                            <NavLink to={"/add-to-cart"} className='add-to-cart'>
                                <img src={cart} alt="add-to-cart" title="" /> Add to Cart
                            </NavLink>
                        }
                        {isAddToCartRouteMatch && (
                            user ?
                                <NavLink to="/upsell-checkout" className='add-to-cart' >
                                    Continue <TbArrowRight size={18} />
                                </NavLink> :
                                <NavLink to="/sign-in" className='add-to-cart' onClickCapture={() => localStorage.setItem("path", "/upsell-checkout")} >
                                    Continue <TbArrowRight size={18} />
                                </NavLink>
                        )}
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

                {/* card 1 */}
                <div className='domain-card md:mb-5'>
                    <div className='flex items-center justify-between gap-3'>
                        <h2 className='flex flex-wrap items-center card-title'>
                            <RiGlobalLine className='mr-1.5 text-lg' />
                            <span className='text-primary dark:text-gray-500'>apple</span>
                            <span className='text-darkbtn dark:text-white'>.kitchen</span>
                            <span className='text-primary dark:text-gray-500'> + .com + .online</span>
                        </h2>
                        <button className='btn-sky'>Package</button>
                    </div>

                    <hr className='card-divider my-6' />

                    <div className='text-left space-y-2'>
                        <p className='flex text-primary dark:text-gray-500 text-base font-medium gap-1.5 items-center'>For the first year <FiInfo /></p>
                        <p className='price-tag'>$34.99 <span>$51.99</span></p>
                        <span className='save-lable'>Save 45%</span>
                    </div>

                    <div className='flex justify-start mt-5'>
                        {isDomainRouteMatch &&
                            <NavLink to={"/add-to-cart"} className='btn-outline w-40'>
                                <svg width="17" height="17" viewBox="0 0 17 17" fill="none" xmlns="http://www.w3.org/2000/svg">
                                    <path d="M7.1665 9.33331C7.0339 9.33331 6.90672 9.38599 6.81295 9.47976C6.71918 9.57353 6.6665 9.7007 6.6665 9.83331C6.6665 9.96592 6.71918 10.0931 6.81295 10.1869C6.90672 10.2806 7.0339 10.3333 7.1665 10.3333H9.83317C9.96578 10.3333 10.093 10.2806 10.1867 10.1869C10.2805 10.0931 10.3332 9.96592 10.3332 9.83331C10.3332 9.7007 10.2805 9.57353 10.1867 9.47976C10.093 9.38599 9.96578 9.33331 9.83317 9.33331H7.1665Z" fill="currentcolor" />
                                    <path fillRule="evenodd" clipRule="evenodd" d="M10.2764 2.05333C10.395 1.99405 10.5322 1.98428 10.658 2.02616C10.7838 2.06804 10.8878 2.15814 10.9471 2.27666L12.1558 4.694C12.4407 4.70777 12.7007 4.73133 12.9358 4.76466C13.6398 4.86533 14.2224 5.08266 14.6364 5.59466C15.0504 6.10666 15.1411 6.722 15.0924 7.43133C15.0458 8.11866 14.8591 8.986 14.6271 10.0693L14.3264 11.474C14.1698 12.2053 14.0424 12.798 13.8824 13.2607C13.7158 13.744 13.4958 14.1407 13.1211 14.444C12.7464 14.7473 12.3118 14.8787 11.8051 14.9407C11.3184 15 10.7118 15 9.96511 15H7.03444C6.28644 15 5.68044 15 5.19377 14.9407C4.68711 14.8787 4.25244 14.7473 3.87777 14.444C3.50311 14.1407 3.28311 13.744 3.11644 13.2613C2.95644 12.798 2.82977 12.2053 2.67244 11.4747L2.37177 10.07C2.13977 8.986 1.95377 8.11866 1.90644 7.43133C1.85777 6.722 1.94844 6.10733 2.36244 5.59466C2.77577 5.08266 3.35844 4.86533 4.06244 4.76466C4.29799 4.73177 4.55799 4.70822 4.84244 4.694L6.05311 2.27666C6.11295 2.15908 6.21685 2.06992 6.34215 2.02861C6.46745 1.98731 6.604 1.99719 6.72204 2.05613C6.84008 2.11506 6.93005 2.21826 6.97233 2.34323C7.01461 2.46821 7.00579 2.60483 6.94777 2.72333L5.97444 4.668C6.21711 4.66666 6.47244 4.66622 6.74044 4.66666H10.2591C10.5271 4.66666 10.7824 4.66711 11.0251 4.668L10.0524 2.72333C9.99316 2.60477 9.98339 2.46753 10.0253 2.34176C10.0671 2.216 10.1573 2.11202 10.2758 2.05266M4.32111 5.73866L4.05244 6.276C4.02251 6.3348 4.00451 6.39896 3.99949 6.46475C3.99446 6.53055 4.00252 6.59669 4.02318 6.65936C4.04384 6.72203 4.0767 6.77999 4.11987 6.8299C4.16304 6.87981 4.21566 6.92068 4.2747 6.95015C4.33373 6.97963 4.39802 6.99713 4.46386 7.00164C4.52969 7.00615 4.59577 6.99758 4.65827 6.97644C4.72078 6.95529 4.77849 6.92198 4.82806 6.87842C4.87763 6.83487 4.91809 6.78193 4.94711 6.72266L5.47177 5.67333C5.85177 5.66666 6.28511 5.666 6.78111 5.666H10.2184C10.7144 5.666 11.1478 5.666 11.5278 5.67266L12.0524 6.72266C12.1123 6.84024 12.2162 6.9294 12.3415 6.97071C12.4668 7.01202 12.6033 7.00213 12.7214 6.9432C12.8394 6.88427 12.9294 6.78107 12.9717 6.65609C13.0139 6.53111 13.0051 6.39449 12.9471 6.276L12.6784 5.73866L12.7944 5.754C13.3838 5.83866 13.6724 5.99266 13.8591 6.22266C14.0424 6.44933 14.1324 6.758 14.0964 7.33266H2.90311C2.86711 6.758 2.95711 6.44933 3.14044 6.22266C3.32711 5.99266 3.61577 5.83866 4.20511 5.754L4.32111 5.73866ZM3.35844 9.9C3.24382 9.37939 3.13692 8.85711 3.03777 8.33333H13.9618C13.8622 8.85707 13.7551 9.37935 13.6404 9.9L13.3551 11.2333C13.1898 12.0033 13.0751 12.536 12.9371 12.9347C12.8038 13.3213 12.6678 13.5253 12.4924 13.6667C12.3178 13.808 12.0891 13.8987 11.6844 13.948C11.2651 13.9993 10.7198 14 9.93244 14H7.06644C6.27977 14 5.73444 13.9993 5.31511 13.948C4.90977 13.8987 4.68177 13.808 4.50711 13.6667C4.33177 13.5253 4.19511 13.3207 4.06244 12.9347C3.92444 12.536 3.80911 12.0033 3.64444 11.2333L3.35844 9.9Z" fill="currentcolor" />
                                </svg>
                                Add to Cart
                            </NavLink>}

                        {isAddToCartRouteMatch && (
                            user ?
                                <NavLink to="/upsell-checkout" className='add-to-cart' >
                                    Continue <TbArrowRight size={18} />
                                </NavLink> :
                                <NavLink to="/sign-in" className='add-to-cart' onClickCapture={() => localStorage.setItem("path", "/upsell-checkout")} >
                                    Continue <TbArrowRight size={18} />
                                </NavLink>
                        )}
                    </div>

                    <hr className='card-divider my-6' />

                    <div className='flex flex-col w-full gap-4'>
                        <p className='flex items-center gap-2 text-left text-primary dark:text-gray-400 text-sm font-medium'>
                            <MdCheck className='w-5 h-5 flex-none' />
                            Save money and boost your brand’s visibility by getting a domain bundle.
                        </p>
                        <p className='flex items-center gap-2 text-left text-primary dark:text-gray-400 text-sm font-medium'>
                            <MdCheck className='w-5 h-5 flex-none' />
                            Keep all your domains safe and easy to manage from one single account.
                        </p>
                    </div>
                </div>
            </div>
        </div>
    )
}

export default searchDomain