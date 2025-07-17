import { RiGlobalLine } from "react-icons/ri";
import { TbArrowRight  } from "react-icons/tb";
import ViewCartSidebar from "../layout/ViewCartSidebar";

const BottomCartView = () => {
	return (
		<div className='py-6 bg-slatelight dark:bg-gray-800'>
            <div className='max-w-5xl mx-auto'>
                <div className='flex items-center justify-between gap-3'>
                    <div className='flex flex-col gap-1 font-medium'>
                        <h2 className='flex flex-wrap items-center card-title'>
                            <RiGlobalLine className='mr-1.5 text-lg' />
                            <span className='text-primary dark:text-gray-500'>6 domains</span>
                        </h2>
                        <p>Subtotal: <span className='text-tealdark'>$9.99</span></p>
                    </div>
                    <div className='flex items-center justify-center gap-2'>
                        <a href='#' className='btn-text-link'>
                            View Cart
                        </a>
                        <a href='#' className='add-to-cart'>
                            Continue <TbArrowRight size={18} />
                        </a>
                    </div>
                </div>
            </div>

            {/* cart sidebar view */}
            <ViewCartSidebar />
        </div>
    )
}
export default BottomCartView