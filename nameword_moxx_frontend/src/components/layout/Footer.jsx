import { logo , phone, email } from "../common/icons";
import { FaInstagram } from "react-icons/fa6";
import { FaFacebookF } from "react-icons/fa6";
import { FaLinkedinIn } from "react-icons/fa6";
import { FaXTwitter } from "react-icons/fa6";

const Footer = () => { 

    return (
        <div className="footer">
            {/* top footer menu */}
            <div className="flex mb-12">
                <div className="md:w-2/5 flex flex-col items-start justify-center gap-8">
                    <img src={logo} alt="NameWord Logo" title="NameWord Logo" />
                    <p className="text-lightgray-500 text-15 font-medium">Domains. Hosting.<br/> Zero friction.</p>
                    <div>
                        <a href="tel:+12234123234" className="footer-contact">
                            <img src={phone} alt="phone" title="phone" />
                            +12 234123234
                        </a>
                        <a href="mailto:hello@nameword.com" className="footer-contact">
                            <img src={email} alt="email" title="email" />
                            hello@nameword.com
                        </a>
                    </div>
                </div>
                <div className="w-3/5 grid lg:grid-cols-3 gap-3">
                    <div className="flex flex-col items-start justify-start">
                        <p className="footer-menu">Menu</p>
                        <a href="#" className="footer-link mb-3">Domain Search </a>
                        <a href="#" className="footer-link mb-3">Web & Email Hosting </a>
                        <a href="#" className="footer-link mb-3">Web Design </a>
                        <a href="#" className="footer-link mb-3">Developer API </a>
                        <a href="#" className="footer-link mb-3">My Account </a>
                    </div>
                    <div className="flex flex-col items-start justify-start">
                        <p className="footer-menu">Support</p>
                        <a href="#" className="footer-link mb-3">Contact Us </a>
                        <a href="#" className="footer-link mb-3">Quick chat </a>
                        <a href="#" className="footer-link mb-3">Help Desk </a>
                    </div>
                    <div className="flex flex-col items-start justify-start">
                        <p className="footer-menu">Follow us</p>
                        <div className="flex gap-2.5 items-center">
                            <a href="#" className="social-link">
                                <FaInstagram />
                            </a>
                            <a href="#" className="social-link">
                                <FaFacebookF size={20} />
                            </a>
                            <a href="#" className="social-link">
                                <FaLinkedinIn />
                            </a>
                            <a href="#" className="social-link">
                                <FaXTwitter />
                            </a>
                        </div>
                    </div>
                </div>
            </div>

            <hr className="w-full border border-lightgray-100 dark:border-gray-800 my-8"/>

            {/* Copyright text */}
            <div className="flex justify-between gap-3">
                <p className="text-lightgray-500 text-15 font-medium">2025 © All rights reserved</p>
                <div className="flex items-center justify-end gap-10">
                    <a href="#" className="footer-link">Terms and Coniditions</a>
                    <a href="#" className="footer-link">Privacy Policy</a>
                </div>
            </div>

        </div>
    );
}

export default Footer