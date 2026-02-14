import React, { useState } from "react";
import Navbar from "../shared/Navbar";
import { Label } from "../ui/label";
import { Input } from "../ui/input";
import { RadioGroup } from "../ui/radio-group";
import { Button } from "../ui/button";
import { Link, useNavigate } from "react-router-dom";
import axios from "axios";
import { USER_API_END_POINT } from "@/utils/constant";
import { toast } from "sonner";
import { useDispatch, useSelector } from "react-redux";
import { setLoading } from "@/redux/authSlice";
import { Loader2 } from "lucide-react";
import { motion } from "framer-motion";
import bg from "../../assets/bg.png";

const Signup = () => {
  const [input, setInput] = useState({
    fullname: "",
    email: "",
    phoneNumber: "",
    password: "",          // 🔥 IMPORTANT (prevents undefined errors)
    role: "",
    file: "",
  });

  const [strength, setStrength] = useState(0);

  const { loading } = useSelector((store) => store.auth);
  const dispatch = useDispatch();
  const navigate = useNavigate();

  // ---------- Password strength checker ----------
  const getPasswordStrength = (password) => {
    if (!password) return 0; // 🔥 prevents undefined.replace error

    const clean = password.replace(/\s/g, "");

    let score = 0;
    if (clean.length >= 6) score++;
    if (/[A-Z]/.test(clean)) score++;
    if (/[0-9]/.test(clean)) score++;
    if (/[!@#$%^&*]/.test(clean)) score++;

    return score;
  };

  const changeEventHandler = (e) => {
    const { name, value } = e.target;

    if (name === "password") {
      setStrength(getPasswordStrength(value));
    }

    setInput({ ...input, [name]: value || "" });
  };

  const changeFileHandler = (e) => {
    setInput({ ...input, file: e.target.files?.[0] });
  };

  const submitHandler = async (e) => {
    e.preventDefault();

    // Email validation
    const emailRegex = /^\S+@\S+\.\S+$/;
    if (!emailRegex.test(input.email)) {
      return toast.error("Please enter a valid email");
    }

    // Phone validation
    const phoneRegex = /^\d{10}$/;
    if (!phoneRegex.test(input.phoneNumber)) {
      return toast.error("Phone number must be exactly 10 digits");
    }

    // Password strength validation
    if (strength < 3) {
      return toast.error("Password is too weak. Make it stronger.");
    }

    if (!input.role) {
      return toast.error("Please select a role");
    }

    const formData = new FormData();
    formData.append("fullname", input.fullname);
    formData.append("email", input.email);
    formData.append("phoneNumber", input.phoneNumber);
    formData.append("password", input.password);
    formData.append("role", input.role);
    if (input.file) formData.append("file", input.file);

    try {
      dispatch(setLoading(true));
      const res = await axios.post(`${USER_API_END_POINT}/register`, formData, {
        headers: { "Content-Type": "multipart/form-data" },
        withCredentials: true,
      });

      if (res.data.success) {
        toast.success(res.data.message);
        navigate("/login");
      }
    } catch (error) {
      toast.error(error.response?.data?.message || "Something went wrong");
    } finally {
      dispatch(setLoading(false));
    }
  };

  return (
    <div className="relative min-h-screen flex flex-col">
      <div className="absolute inset-0">
        <img src={bg} alt="bg" className="w-full h-full object-cover" />
        <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" />
      </div>

      <Navbar />

      <div className="relative flex items-center justify-center flex-1 px-4 z-10">
        <motion.form
          onSubmit={submitHandler}
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="w-full sm:w-2/3 lg:w-1/2 bg-white rounded-2xl p-10 shadow-2xl"
        >
          <h1 className="font-bold text-3xl mb-6 text-center text-red-500">
            Create Your Account
          </h1>

          {/* Full Name */}
          <div className="my-4">
            <Label>Full Name</Label>
            <Input
              type="text"
              name="fullname"
              value={input.fullname}
              onChange={changeEventHandler}
              placeholder="Aakruti Gulhane"
              required
            />
          </div>

          {/* Email */}
          <div className="my-4">
            <Label>Email</Label>
            <Input
              type="email"
              name="email"
              value={input.email}
              onChange={changeEventHandler}
              placeholder="aakruti@gmail.com"
              required
            />
          </div>

          {/* Phone Number */}
          <div className="my-4">
            <Label>Phone Number</Label>
            <Input
              type="text"
              name="phoneNumber"
              maxLength={10}
              value={input.phoneNumber}
              onChange={changeEventHandler}
              placeholder="8799847593"
              required
            />

            {input.phoneNumber.length > 0 &&
              input.phoneNumber.length < 10 && (
                <p className="text-red-500 text-sm mt-1">
                  Please enter exactly 10 digits
                </p>
              )}
          </div>

          {/* Password */}
          <div className="my-4">
            <Label>Password</Label>
            <Input
              type="password"
              name="password"
              value={input.password}
              onChange={changeEventHandler}
              placeholder="Aa@12345"
              required
            />

           
            <div className="h-2 bg-gray-300 rounded mt-2">
              <div
                className={`h-full rounded transition-all duration-300 ${
                  strength === 1
                    ? "bg-red-500 w-1/4"
                    : strength === 2
                    ? "bg-yellow-500 w-2/4"
                    : strength === 3
                    ? "bg-blue-500 w-3/4"
                    : strength === 4
                    ? "bg-green-500 w-full"
                    : "w-0"
                }`}
              ></div>
            </div>

            <p className="mt-1 text-sm">
              {strength === 0 && "Very Weak"}
              {strength === 1 && "Weak"}
              {strength === 2 && "Medium"}
              {strength === 3 && "Strong"}
              {strength === 4 && "Very Strong"}
            </p>
          </div>


          <div className="flex flex-col sm:flex-row items-center justify-between gap-6 my-6">
            <RadioGroup className="flex items-center gap-6">
              <div className="flex items-center space-x-2">
                <Input
                  type="radio"
                  name="role"
                  value="student"
                  checked={input.role === "student"}
                  onChange={changeEventHandler}
                />
                <Label>Student</Label>
              </div>

              <div className="flex items-center space-x-2">
                <Input
                  type="radio"
                  name="role"
                  value="recruiter"
                  checked={input.role === "recruiter"}
                  onChange={changeEventHandler}
                />
                <Label>Recruiter</Label>
              </div>
            </RadioGroup>

            <div className="flex items-center gap-3">
              <Label>Profile</Label>
              <Input type="file" accept="image/*" onChange={changeFileHandler} />
            </div>
          </div>

        
          {loading ? (
            <Button className="w-full my-4 flex justify-center items-center bg-indigo-500 text-white">
              <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Please wait...
            </Button>
          ) : (
            <motion.button
              type="submit"
              whileHover={{ scale: 1.05 }}
              className="w-full my-4 bg-green-500 hover:bg-green-600 text-white font-semibold rounded-lg py-3 shadow-md"
            >
              Sign Up
            </motion.button>
          )}

          <span className="block text-center text-sm text-gray-600 mt-4">
            Already have an account?{" "}
            <Link to="/login" className="text-indigo-600 font-semibold">
              Login
            </Link>
          </span>
        </motion.form>
      </div>
    </div>
  );
};

export default Signup;
