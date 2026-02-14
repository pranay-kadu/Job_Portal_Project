import React, { useState } from "react";
import Navbar from "./shared/Navbar";
import { Avatar, AvatarImage } from "./ui/avatar";
import { Button } from "./ui/button";
import { Contact, Mail, Pen } from "lucide-react";
import { Badge } from "./ui/badge";
import { Label } from "./ui/label";
import AppliedJobTable from "./AppliedJobTable";
import UpdateProfileDialog from "./UpdateProfileDialog";
import { useSelector } from "react-redux";
import useGetAppliedJobs from "../hooks/useGetAppliedJobs"
//const skills = ["Html", "css", "javascript", "reactjs"];
const isResume = true;

const Profile = () => {
useGetAppliedJobs();
  const [open, setOpen] = useState(false);
  const {user} = useSelector(store=>store.auth);


  return (
    <div>
      <Navbar />
      <div className="max-w-5xl mx-auto bg-white border border-gray-200 rounded-2xl my-5 p-8 shadow-2xl">
        <div className="flex justify-between">
          <div className="flex items-center gap-4">
            <Avatar className="h-24 w-24">
              <AvatarImage
                src={user?.profile?.profilePhoto}
                alt="profile"
              />
            </Avatar>
            <div>
              <h1 className="font-bold text-xl text-[#0f4c81]">{user?.fullname}</h1>
              <p className="text-gray-600 ">
                {user?.profile?.bio}
              </p>
            </div>
          </div>
          <Button onClick={() => setOpen(true)}
            className="flex items-center justify-center w-10 h-10 p-2 rounded-full border-gray-300 text-gray-700 hover:bg-gray-100 hover:text-black transition-all duration-300"
            variant="outline"
          >
            <Pen />
          </Button>
        </div>
        <div className="my-5">
          <div className="flex items-center gap-3 my-2">
            <Mail />
            <span>{user?.email}</span>
          </div>
          <div className="flex items-center gap-3 my-2">
            <Contact />
            <span>{user?.phoneNumber}</span>
          </div>
        </div>
        <div className="my-5">
          <h1 className="font-bold text-lg text-[#0f4c81]">Skills</h1>
          <div className="flex items-center gap-2 my-2">
            {
            user?.profile?.skills.length != 0 ? (
              user?.profile?.skills.map((item, index) => (
                <Badge
                  className="text-green-700 font-semibold border border-green-200 bg-green-50 transition duration-300 hover:scale-105 text-sm"
                  key={index}
                >
                  {item}
                </Badge>
              ))
            ) : (
              <span>No skills found</span>
            )}
          </div>
        </div>
        <div className="grid w-full max-w-sm items-center gap-1.5">
          <Label className="text-lg font-bold text-[#0f4c81]">Resume</Label>
          {isResume ? (
            <a
              href={user?.profile?.resume}
              onClick={async (e) => {
                e.preventDefault();
                const url = user?.profile?.resume;
                const filename = user?.profile?.resumeOriginalName || "resume.pdf";
                if (!url) return;
                try {
                  const resp = await fetch(url);
                  const blob = await resp.blob();
                  const blobUrl = window.URL.createObjectURL(blob);
                  const link = document.createElement("a");
                  link.href = blobUrl;
                  link.download = filename;
                  document.body.appendChild(link);
                  link.click();
                  link.remove();
                  window.URL.revokeObjectURL(blobUrl);
                } catch (err) {
                  // fallback: open in new tab
                  window.open(url, "_blank", "noopener,noreferrer");
                }
              }}
              className="text-blue-600 hover:underline w-full cursor-pointer"
            >
              {user?.profile?.resumeOriginalName}
            </a>
          ) : (
            <span>No Resume Found</span>
          )}
        </div>
        <div className="max-w-4xl mx-auto bg-white rounded-2xl"></div>
        <h1 className="font-bold text-lg text-[#0f4c81] mt-2">Applied Jobs</h1>
        <AppliedJobTable />
      </div>
      <UpdateProfileDialog open={open} setOpen={setOpen}/>
    </div>
  );
};

export default Profile;
