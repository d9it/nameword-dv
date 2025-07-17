import { logo , USA, ES, FR } from "../common/icons";
import useDarkMode from './useDarkMode'
import useDropdown from '../../hook/useDropdown';
import { IoChevronDown } from "react-icons/io5";
import { ImSun } from "react-icons/im";
import { MdOutlineNightlight } from "react-icons/md";

const Navbar = () => { 
	// for change dark and light mode
    const { mode, darkMode, lightMode, systemMode } = useDarkMode();
	const dropdown1 = useDropdown();

	return (
		<div className="sticky top-0 left-0 w-full z-20 bg-white dark:bg-gray-900 p-5">
			<nav className="flex items-center justify-between w-full px-4 sm:px-5 xl:px-7">
				<div className="flex items-center space-x-4">
					<img src={logo} alt="NameWord Logo" title="NameWord Logo" />
				</div>

				<div className="flex justify-between items-center">
					<ul className="flex justify-center items-center gap-10">
						<li>
							<a href="#" className="navlink">Home</a>
						</li>
						<li>
							<a href="#" className="navlink">Services</a>
						</li>
						<li>
							<a href="#" className="navlink">Pricing</a>
						</li>
						<li>
							<a href="#" className="navlink">Contact</a>
						</li>
						<li>
							<a href="#" className="navlink">FAQ</a>
						</li>
					</ul>
					
					<div className="flex items-center gap-2.5 ml-24">
						<div ref={dropdown1.ref} className="relative">
							<button onClick={dropdown1.toggle} type='button' className="language-menu">
								<img src={USA} alt="USA" title="USA" className="w-5 h-3 object-cover object-center" />
								<p>EN</p>
								<IoChevronDown />
							</button>
	
							{/* Dropdown */}
							{dropdown1.isOpen && (
								<div className="dropdown">
									<a href="#" className='dropdown-menu'>
										<img src={USA} alt="USA" title="USA" className="w-5 h-3 object-cover object-center"  />
										<span>EN</span>
									</a>
									<a href="#" className='dropdown-menu'>
										<img src={ES} alt="ES" title="ES" className="w-5 h-3 object-cover object-center"  />
										<span>ES</span>
									</a>
									<a href="#" className='dropdown-menu'>
										<img src={FR} alt="FR" title="FR" className="w-5 h-3 object-cover object-center"  />
										<span>FR</span>
									</a>
								</div>
							)}
						</div>

						<div className="language-menu">
							<button onClick={lightMode} className={`header-icon ${mode === 'light' ? 'text-primary dark:text-white bg-lightgray-200 dark:bg-gray-800 rounded p-1' : ' text-primary dark:text-white bg-tranparent p-1'}`}>
								<ImSun />
							</button>

							<button onClick={darkMode} className={`header-icon rotate-180 ${mode === 'dark' ? 'text-primary dark:text-white bg-lightgray-200 dark:bg-gray-800 rounded p-1' : ' text-primary dark:text-white bg-tranparent p-1'}`}>
								<MdOutlineNightlight />
							</button>
						</div>
					</div>
				</div>

				<ul className="flex justify-center items-center gap-10">
					<li>
						<a href="#" className="navlink">Sign In</a>
					</li>
					<li>
						<a href="#" className="navlink">Create account</a>
					</li>
				</ul>
			</nav>
		</div>
	);
}

export default Navbar