import React, { useEffect, useState } from 'react'
import { Badge } from './ui/badge'
import { Button } from './ui/button'
import { useParams } from 'react-router-dom';
import axios from 'axios';
import { JOB_API_END_POINT, APPLICATION_API_END_POINT } from '@/utils/constant';
import { setSingleJob } from '@/redux/jobSlice';
import { useDispatch, useSelector } from 'react-redux';
import Navbar from './shared/Navbar';
import { toast } from 'sonner';
import Chatbot from './Chatbot';
import useGetAppliedJobs from '@/hooks/useGetAppliedJobs';


const JobDescription = () => {


  const { singleJob, allAppliedJobs } = useSelector(store => store.job);
  const { user } = useSelector(store => store.auth);
  const isIntiallyApplied = singleJob?.applications?.some(application => application.applicant === user?._id) || false;
  const [isApplied, setIsApplied] = useState(isIntiallyApplied);

  const params = useParams();
  const jobId = params.id;
  const dispatch = useDispatch();

  useGetAppliedJobs();

  const applyJobHandler = async () => {
    try {
      const res = await axios.get(`${APPLICATION_API_END_POINT}/apply/${jobId}`, { withCredentials: true });
      console.log(res.data);
      if (res.data.success) {
        setIsApplied(true); // Update the local state
        const updatedSingleJob = { ...singleJob, applications: [...singleJob.applications, { applicant: user?._id }] };
        dispatch(setSingleJob(updatedSingleJob)); // helps us to real time UI update
        toast.success(res.data.message);
      }
    } catch (error) {
      console.log(error);
      toast.error(error.response.data.message);
    }
  }

  useEffect(() => {
    const fetchSingleJob = async () => {
      try {
        const res = await axios.get(`${JOB_API_END_POINT}/get/${jobId}`, { withCredentials: true });
        if (res.data.success) {
          dispatch(setSingleJob(res.data.job));
          const isAppliedInSingle = res.data.job.applications.some(application => application.applicant === user?._id);
          const isAppliedInAll = allAppliedJobs.some(app => app.job?._id === jobId);
          setIsApplied(isAppliedInSingle || isAppliedInAll);
        }
      } catch (error) {
        console.log(error);
      }
    }
    fetchSingleJob();
  }, [jobId, dispatch, user?._id]);

  useEffect(() => {
    if (allAppliedJobs.length > 0) {
      const isAppliedInAll = allAppliedJobs.some(app => app.job?._id === jobId);
      if (isAppliedInAll) {
        setIsApplied(true);
      }
    }
  }, [allAppliedJobs, jobId]);

  return (
    <div>
      <Navbar />
      <div className="max-w-7xl mx-auto my-10">
        <div className="flex justify-between items-center mb-10">
          <div>
            <h1 className="font-bold text-xl text-blue-900">{singleJob?.title}</h1>
            <div className="flex item-center gap-2 mt-4">
              <Badge
                className={" bg-red-50 text-red-500 font-medium px-3 py-1 rounded-full shadow-sm"}
                variant="ghost"
              >
                {singleJob?.position} Positions
              </Badge>
              <Badge
                className={" bg-green-50 text-green-700 font-medium px-3 py-1 rounded-full shadow-sm"}
                variant="ghost"
              >
                {singleJob?.jobType}
              </Badge>
              <Badge
                className={" bg-blue-50 text-blue-600 font-medium px-3 py-1 rounded-full shadow-sm"}
                variant="ghost"
              >
                {singleJob?.salary}LPA
              </Badge>
            </div>
          </div>
          <Button onClick={isApplied ? null : applyJobHandler}
            disabled={isApplied}
            className={`font-semibold px-5 py-2 rounded-lg shadow-md transition-all duration-300 transform active:scale-95
    ${isApplied
                ? "bg-gray-400 cursor-not-allowed text-white"
                : "bg-blue-900 hover:bg-green-600 text-white hover:shadow-lg hover:scale-105"
              }`}
          >
            {isApplied ? "Already Applied" : "Apply Now"}
          </Button>
        </div>
        <h1 className="border-b-2 border-b-gray-300 font-medium py-5">Job Description</h1>
        <div className="my-4">
          <h1 className="font-bold my-1">Role : <span className="pl-4 font-normal text-gray-800">{singleJob?.title}</span></h1>
          <h1 className="font-bold my-1">Location : <span className="pl-4 font-normal text-gray-800">{singleJob?.location}</span></h1>
          <h1 className="font-bold my-1">Description : <span className="pl-4 font-normal text-gray-800">{singleJob?.description}</span></h1>
          <h1 className="font-bold my-1">Experiance : <span className="pl-4 font-normal text-gray-800">{singleJob?.experiance} yrs</span></h1>
          <h1 className="font-bold my-1">Salary : <span className="pl-4 font-normal text-gray-800">{singleJob?.salary}LPA</span></h1>
          <h1 className="font-bold my-1">Total Applicants : <span className="pl-4 font-normal text-gray-800">{singleJob?.applications?.length}</span></h1>
          <h1 className="font-bold my-1">Posted Date : <span className="pl-4 font-normal text-gray-800">{singleJob?.createdAt.split("T")[0]}</span></h1>
        </div>
      </div>
      <Chatbot />
    </div>
  );
};

export default JobDescription;
