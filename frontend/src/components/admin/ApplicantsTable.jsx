import React, { useState } from "react";
import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "../ui/table";
import { Popover, PopoverContent, PopoverTrigger } from "../ui/popover";
import { MoreHorizontal, Eye, Check, X, Trash2 } from "lucide-react";
import { useSelector, useDispatch } from "react-redux";
import { toast } from "sonner";
import { APPLICATION_API_END_POINT } from "@/utils/constant";
import axios from "axios";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "../ui/dialog";
import { setAllApplicants } from "@/redux/applicationSlice";
import Tracker from "../Tracker";

const shortlistingStatus = ["Accepted", "Rejected"];

const ApplicantsTable = () => {
  const dispatch = useDispatch();
  const { applicants } = useSelector((store) => store.application);
  const [openTrack, setOpenTrack] = useState(false);
  const [selectedApplicant, setSelectedApplicant] = useState(null);

  const statusHandler = async (status, item) => {
    try {
      axios.defaults.withCredentials = true;
      if (status === 'Accepted' && (!item.applicant?.profile?.resume || item.applicant.profile.resume === "NA")) {
        toast.error("Resume is required");
        return;
      }
      const res = await axios.post(
        `${APPLICATION_API_END_POINT}/status/${item._id}/update`,
        { status }
      );
      if (res.data.success) {
        toast.success(res.data.message);
        const updatedApplications = applicants.applications.map((app) => {
          if (app._id === item._id) {
            return { ...app, status: status.toLowerCase() };
          }
          return app;
        });
        dispatch(setAllApplicants({ ...applicants, applications: updatedApplications }));
      }
    } catch (error) {
      toast.error(error.response?.data?.message || "Error");
    }
  };

  const handleDelete = async (id) => {
    try {
      axios.defaults.withCredentials = true;
      const res = await axios.delete(`${APPLICATION_API_END_POINT}/delete/${id}`);
      if (res.data.success) {
        toast.success(res.data.message);
        // Update redux state to remove deleted applicant
        const updatedApplications = applicants.applications.filter(app => app._id !== id);
        dispatch(setAllApplicants({ ...applicants, applications: updatedApplications }));
      }
    } catch (error) {
      toast.error(error.response?.data?.message || "Error deleting application");
    }
  };


  const handleTrack = (applicant) => {
    setSelectedApplicant(applicant);
    setOpenTrack(true);
  };

  const handleUpdateStep = async (stepIndex) => {
    if (!selectedApplicant) return;
    try {
      axios.defaults.withCredentials = true;
      const res = await axios.post(
        `${APPLICATION_API_END_POINT}/status/${selectedApplicant._id}/updateStep`,
        { stepIndex, status: 'completed' }
      );
      if (res.data.success) {
        toast.success(res.data.message);
        setSelectedApplicant(res.data.application);
      }
    } catch (error) {
      toast.error(error.response?.data?.message || "Error updating step");
    }
  };


  const downloadPDF = () => {
    if (!applicants || !applicants.applications?.length) return;

    const printWindow = window.open("", "", "height=800,width=1000");
    if (!printWindow) return;

    const tableHTML = `
      <html>
        <head>
          <title>Applicants List</title>
          <style>
            body { font-family: Arial, sans-serif; padding: 20px; }
            table { width: 100%; border-collapse: collapse; margin-top: 20px; }
            th, td { border: 1px solid black; padding: 8px; text-align: left; }
            th { background-color: #f2f2f2; }
            h2 { text-align: center; }
          </style>
        </head>
        <body>
          <h2>Applicants List</h2>
          <table>
            <thead>
              <tr>
                <th>Full Name</th>
                <th>Email</th>
                <th>Contact</th>
                <th>Resume</th>
              </tr>
            </thead>
            <tbody>
              ${applicants.applications
        .map(
          (item) => `
                <tr>
                  <td>${item.applicant.fullname}</td>
                  <td>${item.applicant.email}</td>
                  <td>${item.applicant.phoneNumber}</td>
                  <td>${item.applicant.profile?.resume || "NA"}</td>
                </tr>
              `
        )
        .join("")}
            </tbody>
          </table>
        </body>
      </html>
    `;

    printWindow.document.write(tableHTML);
    printWindow.document.close();
    printWindow.focus();
    setTimeout(() => {
      printWindow.print();
      printWindow.close();
    }, 500);
  };

  return (
    <div>

      <button
        onClick={downloadPDF}
        className="px-4 py-2 bg-blue-600 text-white rounded-md mb-4"
      >
        Download Applicants PDF
      </button>

      <Table>
        <TableCaption>A list of your recent applied users</TableCaption>
        <TableHeader>
          <TableRow>
            <TableHead>FullName</TableHead>
            <TableHead>Email</TableHead>
            <TableHead>Contact</TableHead>
            <TableHead>Resume</TableHead>
            <TableHead>Date</TableHead>
            <TableHead className="text-right">Action</TableHead>
          </TableRow>
        </TableHeader>

        <TableBody>
          {applicants?.applications?.map((item) => (
            <TableRow key={item._id}>
              <TableCell>{item?.applicant?.fullname}</TableCell>
              <TableCell>{item?.applicant?.email}</TableCell>
              <TableCell>{item?.applicant?.phoneNumber}</TableCell>

              <TableCell>
                {item.applicant?.profile?.resume ? (
                  <a
                    className="text-blue-600 cursor-pointer"
                    href={`${APPLICATION_API_END_POINT}/${item._id}/resume`}
                    // backend will stream with Content-Disposition attachment
                    download={item.applicant.profile.resumeOriginalName}
                    rel="noopener noreferrer"
                  >
                    {item.applicant.profile.resumeOriginalName}
                  </a>
                ) : (
                  "NA"
                )}
              </TableCell>

              <TableCell>
                {item?.applicant?.createdAt?.split("T")[0]}
              </TableCell>

              <TableCell className="float-right cursor-pointer flex items-center gap-2">
                {(item.status === 'accepted' || item.status === 'rejected') && (
                  <Eye
                    className={`w-5 h-5 cursor-pointer ${item.status === 'rejected'
                      ? 'text-red-600'
                      : item.trackingSteps?.every(step => step.status === 'completed')
                        ? 'text-green-600'
                        : 'text-blue-600'
                      }`}
                    onClick={() => handleTrack(item)}
                  />
                )}
                <Popover>
                  <PopoverTrigger>
                    <MoreHorizontal />
                  </PopoverTrigger>
                  <PopoverContent className="w-32 bg-white">
                    {shortlistingStatus.map((status) => {
                      const isDisabled = status === 'Rejected' && item.status === 'accepted';
                      return (
                        <div
                          onClick={() => { if (!isDisabled) statusHandler(status, item); }}
                          key={status}
                          className={`flex w-full items-center justify-between my-2 ${isDisabled ? 'opacity-50 cursor-not-allowed pointer-events-none' : 'cursor-pointer'}`}
                        >
                          <span>{status}</span>
                          {status === 'Accepted' && item.status === 'accepted' && <Check className="w-4 h-4 ml-2 text-green-600" />}
                          {status === 'Rejected' && item.status === 'rejected' && <X className="w-4 h-4 ml-2 text-red-600" />}
                        </div>
                      );
                    })}
                    <div
                      onClick={() => handleDelete(item._id)}
                      className="flex w-full items-center justify-between my-2 cursor-pointer text-red-600 font-medium"
                    >
                      <span>Delete</span>
                      <Trash2 className="w-4 h-4 ml-2" />
                    </div>
                  </PopoverContent>
                </Popover>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>

      <Dialog open={openTrack} onOpenChange={setOpenTrack}>
        <DialogContent className="sm:max-w-[425px] bg-white text-black">
          <DialogHeader>
            <DialogTitle>Applicant Process Workflow</DialogTitle>
          </DialogHeader>
          <div className="flex flex-col gap-4 py-4">
            {selectedApplicant && selectedApplicant.trackingSteps ? (
              <div className="w-full">
                <Tracker
                  steps={selectedApplicant.trackingSteps}
                  currentStep={selectedApplicant.currentStep}
                  onUpdateStep={handleUpdateStep}
                />
              </div>
            ) : (
              <p>No workflow steps available.</p>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default ApplicantsTable;
