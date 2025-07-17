import { eye, support, browser, downtime, quote } from "../common/icons";

const ContactInfo = () => {
    return (
        <div className='mt-12'>
            <div className='conatct-info lg:py-24 md:py-20 sm:py-14 py-12 lg:px-12 md:px-10 px-6'>
                <div className='lg:w-10/12 w-full mx-auto'>
                    <div className='flex w-full gap-6'>
                        <div className='lg:w-2/5 w-full flex flex-col gap-5'>
                            <p className='contact-title mb-10'>34,224 <br/>customers already<br/> chose <span className='text-darkbtn dark:text-gray-800'>NameWord</span></p>

                            <div className='contact-card'>
                                <img src={eye} alt="Zero Hidden Fees" title="Zero Hidden Fees" />
                                <p>Zero Hidden Fees</p>
                            </div>
                        </div>
                        <div className='lg:w-1/5 w-full flex flex-col gap-5'>
                            <div className='contact-card'>
                                <img src={support} alt="24/7 Customer Support" title="24/7 Customer Support" />
                                <p>24/7 Customer Support</p>
                            </div>
                            <div className='contact-card'>
                                <img src={browser} alt="Intuitive Interface" title="Intuitive Interface" />
                                <p>Intuitive Interface</p>
                            </div>
                        </div>
                        <div className='lg:w-2/5 w-full flex flex-col gap-5'>
                            <div className='contact-card w-1/2'>
                                <img src={downtime} alt="No Website Downtimes" title="No Website Downtimes" />
                                <p>No Website Downtimes</p>
                            </div>

                            <div className='testimonial relative p-3 pl-7'>
                                <img src={quote} alt="" title="" className="absolute right-1/5 -top-4" />
                                <p className="mb-3">Your domain name is the <span className='text-darkbtn dark:text-white'>foundation</span> of your online identity. Elevate your brand’s visibility and credibility with the right one.</p>
                                <span className="text-15 font-medium text-primary dark:text-gray-500">– NameWord CEO, John Smith</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>

    )
}

export default ContactInfo