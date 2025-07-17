import { Routes, Route } from "react-router-dom";
import Home from "../pages/Home";
import Domain from "../pages/Domain";
import NoDomain from "../pages/NoDomain";
import AddtoCart from "../pages/AddToCart";
import CreateAccount from "../pages/auth/CreateAccount";
import SignIn from "../pages/auth/SignIn";
import ResetPassword from "../pages/auth/ResetPassword";
import OtpCode from "../pages/auth/OtpCode";
import ChangeEmail from "../pages/auth/ChangeEmail";
import Dashboard from "../pages/Dashboard";

function Router() {
  return (
    <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/domain" element={<Domain />} />
        <Route path="/no-domain" element={<NoDomain />} />
        <Route path="/add-to-cart" element={<AddtoCart />} />
        <Route path="/create-account" element={<CreateAccount />} />
        <Route path="/sign-in" element={<SignIn />} />
        <Route path="/reset-password" element={<ResetPassword />} />
        <Route path="/otp-code" element={<OtpCode />} />
        <Route path="/change-email" element={<ChangeEmail />} />
        <Route path="/dashboard" element={<Dashboard />} />
    </Routes>
  );
}

export default Router;
