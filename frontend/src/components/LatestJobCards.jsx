import React from "react";
import { Badge } from "./ui/badge";
import { useNavigate } from "react-router-dom";

const LatestJobCards = ({job}) => {
  const navigate = useNavigate();
  return (
    <div onClick={()=> navigate(`/description/${job._id}`)} className="p-5 rounded-lg shadow-md bg-white border border-gray-100 cursor-pointer transform transition-all duration-300 hover:shadow-2xl hover:-translate-y-2">
      <div className="transition duration-300 hover:scale-[1.02]">
        <h1 className="font-medium text-lg text-gray-800">{job?.company?.name}</h1>
        <p className="text-sm text-gray-500">India</p>
      </div>

      <div className="mt-3">
        <h1 className="font-bold text-xl my-2 text-[#0f4c81] transition duration-300 hover:text-[#F83002]">
          {job?.title}
        </h1>
        <p className="text-sm text-gray-600 leading-relaxed">
          {job?.description}
        </p>
      </div>

      <div className="flex items-center gap-2 mt-4">
        <Badge
          className="text-red-500 font-semibold border border-red-200 bg-red-50 transition duration-300 hover:scale-105"
          variant="ghost"
        >
          {job?.position} Positions
        </Badge>
        <Badge
          className="text-green-600 font-semibold border border-green-200 bg-green-50 transition duration-300 hover:scale-105"
          variant="ghost"
        >
          {job?.jobType}
        </Badge>
        <Badge
          className="text-blue-600 font-semibold border border-blue-200 bg-blue-50 transition duration-300 hover:scale-105"
          variant="ghost"
        >
          {job?.salary}LPA
        </Badge>
      </div>
    </div>
  );
};

export default LatestJobCards;
