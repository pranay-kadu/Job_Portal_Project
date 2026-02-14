import React, { useState } from "react";
import { Button } from "./ui/button";
import { Search } from "lucide-react";
import { motion } from "framer-motion";
import bg  from "../assets/bg.png"
import { useDispatch } from "react-redux";
import { useNavigate } from "react-router-dom";
import { setSearchedQuery } from "../redux/jobSlice";

const HeroSection = () => {
   const [query, setQuery] = useState("");
    const dispatch = useDispatch();
    const navigate = useNavigate();

    const searchJobHandler = () => {
        dispatch(setSearchedQuery(query));
        navigate("/browse");
    }

  return (
    <div className="relative overflow-hidden text-center min-h-[90vh] flex items-center justify-center">
      {/* Background Image with dark overlay */}
      <div className="absolute inset-0">
        <img
          src={bg}
          alt="Background"
          className="w-full h-full object-cover"
        />
        {/* Reduced blur and slightly lighter overlay */}
        <div className="absolute inset-0 bg-black/40" />
      </div>

      {/* Floating Blobs */}
      <motion.div
        className="absolute top-10 left-10 w-72 h-72 bg-[#0ff] rounded-full mix-blend-multiply filter blur-3xl opacity-30"
        animate={{ y: [0, 40, 0], x: [0, 20, 0] }}
        transition={{ duration: 10, repeat: Infinity, ease: "easeInOut" }}
      />
      <motion.div
        className="absolute bottom-20 right-20 w-96 h-96 bg-[#ff00ff] rounded-full mix-blend-multiply filter blur-3xl opacity-20"
        animate={{ y: [0, -40, 0], x: [0, -20, 0] }}
        transition={{ duration: 12, repeat: Infinity, ease: "easeInOut" }}
      />

      {/* Hero Content */}
      <div className="relative flex flex-col gap-5 z-10 px-4">
        {/* Tagline */}
        <motion.span
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="mx-auto px-6 py-2 rounded-full bg-white/20 text-cyan-400 backdrop-blur-[1px] font-medium shadow-lg"
        >
          Welcome to Our Job Portal
        </motion.span>

        {/* Heading */}
        <motion.h1
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1, delay: 0.3 }}
          className="text-5xl sm:text-6xl font-bold text-white drop-shadow-lg"
        >
          Your Journey from
          <br />
          Learning to Earning{" "}
          <span className="text-cyan-400 ">Begins.</span>
        </motion.h1>

        {/* Description */}
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 1, delay: 0.6 }}
          className="text-gray-300 sm:text-lg max-w-xl mx-auto drop-shadow-md"
        >
          A platform that connects your skills with the right
          opportunities, making your move from learning to earning effortless.
        </motion.p>

        {/* Search Bar */}
        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 1, delay: 0.9, type: "spring" }}
          className="flex w-full sm:w-[40%] shadow-lg border border-gray-700 pl-3 rounded-full items-center gap-4 mx-auto bg-white/10 backdrop-blur-[2px]"
        >
          <input
            type="text"
            onChange={(e)=> setQuery(e.target.value)}
            className="w-full rounded-full p-3 focus:outline-none bg-transparent text-white placeholder-gray-300"
            placeholder="Search your dream jobs..."
          />
          <Button onClick={searchJobHandler}
            className="bg-cyan-500 hover:bg-cyan-600 text-white font-medium rounded-full px-6 py-3 shadow-lg hover:shadow-xl transition-all duration-300 ease-in-out transform hover:scale-105"
          >
            <Search className="h-5 w-5" />
          </Button>
        </motion.div>
      </div>
    </div>
  );
};

export default HeroSection;
