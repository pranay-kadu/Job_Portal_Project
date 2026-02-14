import React from "react";
import { Button } from "./ui/button";
import { Bookmark } from "lucide-react";
import { Avatar, AvatarImage } from "./ui/avatar";
import { Badge } from "./ui/badge";
import { useNavigate } from "react-router-dom";
import Chatbot from "./Chatbot";


const Job = ({job}) => {
  
  const navigate = useNavigate();
  //const jobId = "123"; // Example job ID, replace with actual ID
  
  const daysAgoFunction = (mongodbTime) => {
    const createdAt = new Date(mongodbTime);
    const currentTime = new Date();
    const timeDifference = currentTime - createdAt;
    return Math.floor(timeDifference/(1000*24*60*60))
  }
  
  return (
    <div className="p-5 rounded-md shadow-xl bg-white border border-gray-100">
      {/* Header row */}
      <div className="flex items-center justify-between text-gray-500 text-sm">
        <p className="text-sm text-gray-600">{daysAgoFunction(job?.createdAt) == 0 ? "Today" : `${daysAgoFunction(job?.createdAt)} days ago`} </p>
        <Button variant="ghost" className="rounded-full" size="icon">
          <Bookmark />
        </Button>
      </div>

      {/* Company info */}
      <div className="flex items-center gap-3 my-4">
        <Avatar>
          <AvatarImage src={job?.company?.logo} />
        </Avatar>
        <div>
          <h1 className="font-semibold">{job?.company?.name}</h1>
          <p className="text-sm text-gray-500">India</p>
        </div>
      </div>

      {/* Job description */}
      <div>
        <h1 className="text-lg font-bold my-2 text-blue-900">{job?.title}</h1>
        <p className="text-sm text-gray-500">
          {job?.description}
        </p>
      </div>
      <div className="flex item-center gap-2 mt-4">
              <Badge className={" bg-red-50 text-red-500 font-medium px-3 py-1 rounded-full shadow-sm"} variant="ghost">
                {job?.position} Positions
              </Badge>
              <Badge className={" bg-green-50 text-green-700 font-medium px-3 py-1 rounded-full shadow-sm"} variant="ghost">
                {job?.jobType}
              </Badge>
              <Badge className={" bg-blue-50 text-blue-600 font-medium px-3 py-1 rounded-full shadow-sm"} variant="ghost">
                {job?.salary}LPA
              </Badge>
            </div>
            <div className="flex items-center gap-4 mt-4">
            <Button onClick={() => navigate(`/description/${job?._id}`)} variant="outline" >Details</Button>
            <Button className="bg-[#0f4c81] hover:bg-[#0d3c6c] text-white">Save for Later</Button>
            </div>
            <Chatbot/>
    </div>
  );
};

export default Job;
