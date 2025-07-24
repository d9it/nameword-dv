import Navbar from '../components/layout/Navbar';
import Footer from '../components/layout/Footer';
import { globeIcon } from "../components/common/icons";
import { TbSearch } from "react-icons/tb";
import NoDomainAvailable from '../components/domain/no-domain-available'
import FindMoreOptions from '../components/domain/find-more-options'
import ContactInfo from '../components/domain/contact-info'
import { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router';
import { useDomainSearch } from '../hooks/useDomainSearch';

const NoDomain = () => {
	const [searchParams] = useSearchParams();
	const [domainName, setDomainName] = useState('apple.com');
	const [searchResults, setSearchResults] = useState(null);
	const [loading, setLoading] = useState(false);
	const { searchDomain } = useDomainSearch();

	useEffect(() => {
		const domain = searchParams.get('domain');
		if (domain) {
			setDomainName(domain);
			handleDomainSearch(domain);
		}
	}, [searchParams]);

	const handleDomainSearch = async (domain) => {
		if (!domain) return;
		setLoading(true);
		try {
			const result = await searchDomain(domain);
			setSearchResults(result);
		} catch (error) {
			console.error('Domain search failed:', error);
		} finally {
			setLoading(false);
		}
	};

	const handleSearch = () => {
		handleDomainSearch(domainName);
	};

	return (
		<div> 
			<Navbar />
			<div className='px-5 mb-10'>
				<div className='search-section w-full'>
					<img src={globeIcon} alt="globe" title='globe' className='globe-image dark:opacity-5'/>
					{/* domain search */}
					<div className='searcharea w-full text-center'>
						<h2 className='mb-8'>Register a new domain</h2>
						<div className='max-w-2xl mx-auto relative'>
							<div className='flex items-center justify-center gap-3 w-full mb-8'>
								<input
									type="text"
									placeholder="Domain, Company Name, Keyword..."
									className='search-input w-full'
									value={domainName}
									onChange={(e) => setDomainName(e.target.value)}
									onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
								/>
								<button 
									className='btn-blue' 
									onClick={handleSearch}
									disabled={loading}
								>
									{loading ? (
										<div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
									) : (
										<TbSearch size={14} />
									)}
								</button>
							</div>

						</div>
						
						{/* No domain availabel */}
						<NoDomainAvailable domainName={domainName} />
					</div>
				</div>

                {/* Find more options */}
                <FindMoreOptions />

                {/* contact info */}
                <ContactInfo />
			</div>
			<Footer />
		</div>
	)
}

export default NoDomain