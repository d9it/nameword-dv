import { IoClose } from "react-icons/io5";
import { LuTrash2 } from "react-icons/lu";
import { useState } from "react";
import { IoChevronDown } from "react-icons/io5";
import { TbArrowRight  } from "react-icons/tb";


const ViewCartSidebar = () => { 
    const [selected, setSelected] = useState("5 Years");
    const [open, setOpen] = useState(false);
    const terms = ["1 Year", "3 Years", "5 Years", "10 Years"];
    
    return (
        <div className='view-cart'>
            <div className='flex items-center justify-between gap-2 mb-3'>
                <h2 className="heading-title">Cart</h2>
                <IoClose className='text-primary dark:text-gray-500' size={30} />
            </div>

            <div className='all-cart-items'>
                {/* cart 1 */}
                <div className='cart-card mb-3'>
                    <div className='flex items-center justify-between gap-7'>
                        <h2 className='flex flex-wrap items-center card-title font-medium'>
                            <p className='text-primary dark:text-gray-500 mb-1.5'>apple
                                <span className='text-darkbtn dark:text-white'>.kitchen</span>
                            </p>
                            <p className="text-xs font-medium text-primary dark:text-gray-300">The more domains you lock down, the better you protect your brand.</p>
                        </h2>
                        <LuTrash2 className='text-primary dark:text-gray-300 min-w-5' size={18} />
                    </div>
                    <hr className='card-divider my-6' />

                    <div className='flex gap-2 justify-between items-center'>
                        <div className='flex flex-col gap-3'>
                            <p className="cart-title text-15">.KITCHEN domain registration</p>

                            {/* term select option */}
                            <div className="relative w-48">
                                <div onClick={() => setOpen(!open)} className="term-select" >
                                    <p className="text-xs text-secondary font-medium">Term</p>
                                    <div className="flex justify-between items-center">
                                        <span className="text-sm font-medium text-primary dark:text-gray-400">{selected}</span>
                                        <IoChevronDown className="w-4 h-4 text-primary dark:text-gray-400" />
                                    </div>
                                </div>

                                {/* Dropdown items */}
                                {open && (
                                    <div className="dropdown-select">
                                    {terms.map((term) => (
                                        <div
                                        key={term}
                                        onClick={() => {
                                            setSelected(term);
                                            setOpen(false);
                                        }}
                                        className={`px-4 py-2 cursor-pointer hover:bg-slatelight dark:hover:bg-gray-800 text-sm font-medium text-primary dark:text-gray-400 ${
                                            selected === term ? "bg-slatelight dark:bg-gray-800 font-medium" : ""
                                        }`}
                                        >
                                        {term}
                                        </div>
                                    ))}
                                    </div>
                                )}
                            </div>
                            <p className="cart-title text-xs">Renews in July 2030 for $9.99</p>
                        </div>
                        <div className='flex flex-col items-end gap-1 text-primary dark:text-gray-300'>
                            <p className='text-base font-medium text-tealdark'>$9.99</p>
                            <p className='text-sm font-medium line-through'>$21.99</p>
                            <p className='text-xs font-medium'>15% off</p>
                        </div>
                    </div>
                </div>

                {/* cart 2 */}
                <div className='cart-card mb-3'>
                    <div className='flex items-center justify-between gap-7'>
                        <h2 className='flex flex-wrap items-center card-title font-medium'>
                            <p className='text-primary dark:text-gray-500 mb-1.5'>
                                Brand Protection Domain Package
                            </p>
                        </h2>
                        <LuTrash2 className='text-primary dark:text-gray-300 min-w-5' size={18} />
                    </div>
                    <hr className='card-divider my-6' />

                    <div className='flex gap-2 justify-between items-center'>
                        <div className='flex flex-col gap-3'>
                            <p className="cart-title text-15">.Domain Package (.kitchen + .com + .online)</p>

                            {/* term select option */}
                            <div className="relative w-48">
                                <div onClick={() => setOpen(!open)} className="term-select" >
                                    <p className="text-xs text-secondary font-medium">Term</p>
                                    <div className="flex justify-between items-center">
                                        <span className="text-sm font-medium text-primary dark:text-gray-400">{selected}</span>
                                        <IoChevronDown className="w-4 h-4 text-primary dark:text-gray-400" />
                                    </div>
                                </div>

                                {/* Dropdown items */}
                                {open && (
                                    <div className="dropdown-select">
                                    {terms.map((term) => (
                                        <div
                                        key={term}
                                        onClick={() => {
                                            setSelected(term);
                                            setOpen(false);
                                        }}
                                        className={`px-4 py-2 cursor-pointer hover:bg-slatelight dark:hover:bg-gray-800 text-sm font-medium text-primary dark:text-gray-400 ${
                                            selected === term ? "bg-slatelight dark:bg-gray-800 font-medium" : ""
                                        }`}
                                        >
                                        {term}
                                        </div>
                                    ))}
                                    </div>
                                )}
                            </div>
                        </div>
                        <div className='flex flex-col items-end gap-1 text-primary dark:text-gray-300'>
                            <p className='text-base font-medium text-tealdark'>$155.99</p>
                            <p className='text-sm font-medium line-through'>$224.99</p>
                            <p className='text-xs font-medium'>45% off</p>
                        </div>
                    </div>

                    <hr className='card-divider my-6' />

                    <div className='flex flex-col card-title font-medium mb-3'>
                        <p className='text-primary dark:text-gray-500 mb-1'>apple
                            <span className='text-darkbtn dark:text-white'>.kitchen</span>
                        </p>
                        <p className="cart-title text-xs">Renews July 2026 for $24.99</p>
                    </div>

                    <div className='flex flex-col card-title font-medium mb-3'>
                        <p className='text-primary dark:text-gray-500 mb-1'>apple
                            <span className='text-darkbtn dark:text-white'>.com</span>
                        </p>
                        <p className="cart-title text-xs">Renews July 2026 for $27.99</p>
                    </div>

                    <div className='flex flex-col card-title font-medium mb-3'>
                        <p className='text-primary dark:text-gray-500 mb-1'>apple
                            <span className='text-darkbtn dark:text-white'>.online</span>
                        </p>
                        <p className="cart-title text-xs">enews July 2026 for $18.64</p>
                    </div>
                </div>

                {/* cart 3 */}
                <div className='cart-card mb-3'>
                    <div className='flex items-center justify-between gap-7'>
                        <h2 className='flex flex-wrap items-center card-title font-medium'>
                            <p className='text-primary dark:text-gray-500 mb-1.5'>apple
                                <span className='text-darkbtn dark:text-white'>.org</span>
                            </p>
                            <p className="text-xs font-medium text-primary dark:text-gray-300">The more domains you lock down, the better you protect your brand.</p>
                        </h2>
                        <LuTrash2 className='text-primary dark:text-gray-300 min-w-5' size={18} />
                    </div>
                    <hr className='card-divider my-6' />

                    <div className='flex gap-2 justify-between items-center'>
                        <div className='flex flex-col gap-3'>
                            <p className="cart-title text-15">.KITCHEN domain registration</p>

                            {/* term select option */}
                            <div className="relative w-48">
                                <div onClick={() => setOpen(!open)} className="term-select" >
                                    <p className="text-xs text-secondary font-medium">Term</p>
                                    <div className="flex justify-between items-center">
                                        <span className="text-sm font-medium text-primary dark:text-gray-400">{selected}</span>
                                        <IoChevronDown className="w-4 h-4 text-primary dark:text-gray-400" />
                                    </div>
                                </div>

                                {/* Dropdown items */}
                                {open && (
                                    <div className="dropdown-select">
                                    {terms.map((term) => (
                                        <div
                                        key={term}
                                        onClick={() => {
                                            setSelected(term);
                                            setOpen(false);
                                        }}
                                        className={`px-4 py-2 cursor-pointer hover:bg-slatelight dark:hover:bg-gray-800 text-sm font-medium text-primary dark:text-gray-400 ${
                                            selected === term ? "bg-slatelight dark:bg-gray-800 font-medium" : ""
                                        }`}
                                        >
                                        {term}
                                        </div>
                                    ))}
                                    </div>
                                )}
                            </div>
                            <p className="cart-title text-xs">Renews in July 2026 for $9.99</p>
                        </div>
                        <div className='flex flex-col items-end gap-1 text-primary dark:text-gray-300'>
                            <p className='text-base font-medium text-tealdark'>$18.99</p>
                            <p className='text-sm font-medium line-through'>$34.99</p>
                            <p className='text-xs font-medium'>21% off</p>
                        </div>
                    </div>
                </div>

            </div>

            <div className='flex items-center justify-end gap-2 py-5'>
                <a href='#' className='btn-text-link'>
                    Back to Shopping
                </a>
                <a href='#' className='add-to-cart'>
                    Continue <TbArrowRight size={18} />
                </a>
            </div>
        </div>
    )
}
export default ViewCartSidebar