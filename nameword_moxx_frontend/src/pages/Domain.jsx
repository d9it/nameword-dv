import Navbar from '../components/layout/Navbar';
import Footer from '../components/layout/Footer';
import { globeIcon } from "../components/common/icons";
import { TbSearch } from "react-icons/tb";
import SearchDomainCard from '../components/domain/search-domain-card'
// import NoDomainAvailable from '../components/domain/no-domain-available'
import FindMoreOptions from '../components/domain/find-more-options'
import ContactInfo from '../components/domain/contact-info'

const Domain = () => {
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
								/>
								<button className='btn-blue'>
									<TbSearch size={14} />
								</button>
							</div>

						</div>
						
                        {/* search domain card */}
                        <SearchDomainCard />

						{/* No domain availabel */}
						{/* <NoDomainAvailable /> */}
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

export default Domain