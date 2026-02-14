import React, { useState } from "react";
import Navbar from "../shared/Navbar";
import { Label } from "../ui/label";
import { Input } from "../ui/input";
import { RadioGroup } from "../ui/radio-group";
import { Button } from "../ui/button";
import { Link, useNavigate } from "react-router-dom";
import { toast } from "sonner";
import axios from "axios";
import { USER_API_END_POINT } from "@/utils/constant";
import { useDispatch, useSelector } from "react-redux";
import { setLoading, setUser } from "@/redux/authSlice";
import { Loader2 } from "lucide-react";
import { motion } from "framer-motion";
import bg  from "../../assets/bg.png"

const Login = () => {
  const [input, setInput] = useState({
    email: "",
    password: "",
    role: "",
  });

  const { loading } = useSelector((store) => store.auth);
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const changeEventHandler = (e) => {
    setInput({ ...input, [e.target.name]: e.target.value });
  };

  const submitHandler = async (e) => {
    e.preventDefault();

    try {
      dispatch(setLoading(true));
      const res = await axios.post(`${USER_API_END_POINT}/login`, input, {
        headers: {
          "Content-Type": "application/json",
        },
        withCredentials: true,
      });
      if (res.data.success) {
        dispatch(setUser(res.data.user));
        navigate("/");
        toast.success(res.data.message);
      }
    } catch (error) {
      console.log(error);
      toast.error(error.response?.data?.message || "Something went wrong");
    } finally {
      dispatch(setLoading(false));
    }
  };

  return (
    <div className="relative min-h-screen flex flex-col">
      {/* Background Image */}
      <div className="absolute inset-0">
        <img
          src={bg} 
          alt="Job Portal Background"
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" />
      </div>

      <Navbar />

      {/* Login Form */}
      <div className="relative flex items-center justify-center flex-1 px-4 z-10">
        <motion.form
          onSubmit={submitHandler}
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: "easeOut" }}
          className="w-full sm:w-2/3 lg:w-1/3 bg-white rounded-2xl p-10 shadow-2xl"
        >
          <h1 className="font-bold text-3xl mb-6 text-center text-red-500">
            Login to Your Account
          </h1>

          {/* Email */}
          <div className="my-4">
            <Label className="mb-2 block text-gray-700">Email</Label>
            <Input
              type="email"
              value={input.email}
              name="email"
              onChange={changeEventHandler}
              placeholder="aakruti@gmail.com"
              className="focus:ring-2 focus:ring-blue-800 border-gray-300 rounded-lg"
            />
          </div>

          {/* Password */}
          <div className="my-4">
            <Label className="mb-2 block text-gray-700">Password</Label>
            <Input
              type="password"
              value={input.password}
              name="password"
              onChange={changeEventHandler}
              placeholder="@Aakruti123"
              className="focus:ring-2 focus:ring-blue-800 border-gray-300 rounded-lg"
            />
          </div>

          {/* Role */}
          <div className="flex items-center justify-between my-6">
            <RadioGroup className="flex items-center gap-6">
              <div className="flex items-center space-x-2">
                <Input
                  type="radio"
                  name="role"
                  value="student"
                  checked={input.role === "student"}
                  onChange={changeEventHandler}
                  className="cursor-pointer"
                />
                <Label className="text-gray-700">Student</Label>
              </div>
              <div className="flex items-center space-x-2">
                <Input
                  type="radio"
                  name="role"
                  value="recruiter"
                  checked={input.role === "recruiter"}
                  onChange={changeEventHandler}
                  className="cursor-pointer"
                />
                <Label className="text-gray-700">Recruiter</Label>
              </div>
            </RadioGroup>
          </div>

          {/* Button */}
          {loading ? (
            <Button className="w-full my-4 flex justify-center items-center bg-green-500 hover:bg-green-600 text-white font-semibold rounded-lg py-2 shadow-md">
              <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Please wait...
            </Button>
          ) : (
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.97 }}
              type="submit"
              className="w-full my-4 bg-green-500 hover:bg-blue-800 text-white font-semibold rounded-lg py-3 shadow-md transition-all duration-300"
            >
              Login
            </motion.button>
          )}

          {/* Redirect */}
          <span className="block text-center text-sm text-gray-600 mt-4">
            Don&apos;t have an account?{" "}
            <Link
              to="/signup"
              className="text-blue-600 font-semibold hover:underline"
            >
              Signup
            </Link>
          </span>
        </motion.form>
      </div>
    </div>
  );
};

export default Login;
