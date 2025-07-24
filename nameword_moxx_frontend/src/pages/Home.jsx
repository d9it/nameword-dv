import Navbar from '../components/layout/Navbar';
import Footer from '../components/layout/Footer';
import { globeIcon } from "../components/common/icons";
import { TbSearch } from "react-icons/tb";
import { useState, useEffect } from 'react';
import { useDomainSearch } from '../hooks/useDomainSearch';
import { useDomainSuggestions } from '../hooks/useDomainSuggestions';
import { NavLink } from 'react-router';

const Home = () => {
	const [dropdown, setDropDown] = useState(false);
	const [searchTerm, setSearchTerm] = useState('');
	const [suggestions, setSuggestions] = useState([]);
	const [searchResults, setSearchResults] = useState(null);

	const { searchDomain, searchResults: domainResults, loading: searchLoading, error: searchError } = useDomainSearch();
	const { getSuggestions, loading: suggestionsLoading } = useDomainSuggestions();

	// Handle domain search
	const handleSearch = async () => {
		if (!searchTerm.trim()) return;

		try {
			const result = await searchDomain(searchTerm);
			setSearchResults(result);
			setDropDown(false);
		} catch (error) {
			console.error('Domain search failed:', error);
		}
	};

	// Handle suggestions when typing
	useEffect(() => {
		const getDomainSuggestions = async () => {
			if (searchTerm.length > 2) {
				try {
					const result = await getSuggestions(searchTerm, 5);
					setSuggestions(result);
					setDropDown(true);
				} catch (error) {
					console.error('Failed to get suggestions:', error);
				}
			} else {
				setSuggestions([]);
				setDropDown(false);
			}
		};

		const timeoutId = setTimeout(getDomainSuggestions, 500);
		return () => clearTimeout(timeoutId);
	}, [searchTerm, getSuggestions]);

	// Handle suggestion click
	const handleSuggestionClick = (suggestion) => {
		setSearchTerm(suggestion.domainName);
		setDropDown(false);
		handleSearch();
	};

	// Handle Enter key press
	const handleKeyPress = (e) => {
		if (e.key === 'Enter') {
			handleSearch();
		}
	};

	return (
		<div>
			<Navbar />
			<div className='px-5 mb-10'>
				<div className='search-section w-full'>
					<img src={globeIcon} alt="globe" title='globe' className='globe-image dark:opacity-5' />

					{/* domain search */}
					<div className='searcharea w-full text-center'>
						<h2 className='mb-8'>Register a new domain</h2>
						<div className='max-w-2xl mx-auto relative'>
							<div className='flex items-center justify-center gap-3 w-full'>
								<input
									type="text"
									placeholder="Domain, Company Name, Keyword..."
									className='search-input w-full'
									value={searchTerm}
									onChange={(e) => setSearchTerm(e.target.value)}
									onFocus={() =>setDropDown(true)}
									onBlur={() => setTimeout(() => setDropDown(false), 200)}
									onKeyPress={handleKeyPress}
									disabled={searchLoading}
								/>
								<button 
									className='btn-blue' 
									onClick={handleSearch}
									disabled={searchLoading || !searchTerm.trim()}
								>
									{searchLoading ? (
										<div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
									) : (
									<TbSearch size={14} />
									)}
								</button>
							</div>

							{/* Error message */}
							{searchError && (
								<div className="mt-2 text-red-500 text-sm">
									{searchError}
								</div>
							)}

							{/* Search results */}
							{searchResults && (
								<div className="mt-4 p-4 bg-white dark:bg-gray-900 rounded-md shadow-lg">
									<h3 className="text-lg font-medium text-primary dark:text-white mb-2">
										Search Results for "{searchTerm}"
									</h3>
									{searchResults.responseData?.available ? (
										<div className="text-left">
											<p className="text-green-600 dark:text-green-400 font-medium">
												✓ Domain is available for registration
											</p>
											<div className="mt-2 space-y-1">
												<p className="text-sm text-primary dark:text-gray-300">
													Registration Fee: ${searchResults.responseData.registrationFee}
												</p>
												<p className="text-sm text-primary dark:text-gray-300">
													Renewal Fee: ${searchResults.responseData.renewalfee}
												</p>
												<p className="text-sm text-primary dark:text-gray-300">
													Transfer Fee: ${searchResults.responseData.transferFee}
												</p>
											</div>
										</div>
									) : (
										<p className="text-red-600 dark:text-red-400">
											✗ Domain is not available for registration
										</p>
									)}
								</div>
							)}

							{/* dropdown menu */}
							{dropdown && (
								<div className='search-list'>
									<ul>
										{suggestions.length > 0 ? (
											suggestions.map((suggestion, index) => (
												<li key={index}>
													<NavLink to={`/domain?domain=${suggestion.domainName}`}>
														{suggestion.domainName}
													</NavLink>
												</li>
											))
										) : (
											<>
												<li><NavLink to="/no-domain">apple.com</NavLink></li>
												<li><NavLink to='/domain'>apple.kitchen</NavLink></li>
												<li><a href='#'>apple.free</a></li>
												<li><a href='#'>apple.buy</a></li>
												<li><a href='#'>apple.box</a></li>
											</>
										)}
									</ul>
									<div className='flex items-center gap-2.5 px-4 text-sm font-medium mt-2'>
										<p className='text-lightgray-500'>{suggestions.length || 5} suggestions</p>
										<a href='#' className='text-darkbtn hover:text-darkbtn-hover'>See all</a>
									</div>
								</div>
							)}
						</div>
					</div>
				</div>
			</div>
			<Footer />
		</div>
	)
}

export default Home