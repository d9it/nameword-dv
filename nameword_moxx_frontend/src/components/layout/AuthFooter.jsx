import { logo , phone, email } from "../common/icons";
import { FaInstagram } from "react-icons/fa6";
import { FaFacebookF } from "react-icons/fa6";
import { FaLinkedinIn } from "react-icons/fa6";
import { FaXTwitter } from "react-icons/fa6";
import { useMatch } from "react-router";

const AuthFooter = () => { 

    // const authpages = useMatch("/create-account");

    return (
        <div className="footer">
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

export default AuthFooter