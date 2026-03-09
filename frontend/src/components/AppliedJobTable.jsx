import React, { useState } from 'react'
import { Table, TableBody, TableCaption, TableCell, TableHead, TableHeader, TableRow } from './ui/table'
import { Badge } from './ui/badge'
import { useSelector } from 'react-redux'
import Chatbot from './Chatbot'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from './ui/dialog'
import Tracker from './Tracker'
import { Info } from 'lucide-react'

const AppliedJobTable = () => {
    const { allAppliedJobs } = useSelector(store => store.job);
    const [openTrack, setOpenTrack] = useState(false);
    const [selectedJob, setSelectedJob] = useState(null);

    const handleViewStatus = (job) => {
        if (job.status === 'accepted') {
            setSelectedJob(job);
            setOpenTrack(true);
        }
    };

    return (
        <div>
            <Table>
                <TableCaption>A list of your applied jobs</TableCaption>
                <TableHeader>
                    <TableRow>
                        <TableHead>Date</TableHead>
                        <TableHead>Job Role</TableHead>
                        <TableHead>Company</TableHead>
                        <TableHead className="text-right">Status</TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {
                        allAppliedJobs.length <= 0 ? <span>You haven't applied any job yet.</span> : allAppliedJobs.map((appliedJob) => (
                            <TableRow key={appliedJob._id}>
                                <TableCell>{appliedJob?.createdAt?.split("T")[0]}</TableCell>
                                <TableCell>{appliedJob.job?.title || <span className="text-red-500">Job Removed</span>}</TableCell>
                                <TableCell>{appliedJob.job?.company?.name || <span className="text-gray-500">Company Deleted</span>}</TableCell>
                                <TableCell className="text-right">
                                    <div className="flex items-center justify-end gap-2">
                                        <Badge
                                            className={`${appliedJob?.status === "rejected" ? 'bg-red-400' : appliedJob.status === 'pending' ? 'bg-gray-400' : appliedJob.status === 'accepted' && appliedJob.trackingSteps?.every(step => step.status === 'completed') ? 'bg-green-400' : 'bg-gray-400'}`}
                                        >
                                            {appliedJob.status.toUpperCase()}
                                        </Badge>
                                        {appliedJob.status === 'accepted' && (
                                            <Info
                                                className={`w-5 h-5 cursor-pointer hover:text-blue-600 ${appliedJob.trackingSteps?.every(step => step.status === 'completed') ? 'text-green-600' : 'text-gray-500'}`}
                                                onClick={() => handleViewStatus(appliedJob)}
                                            />
                                        )}
                                    </div>
                                </TableCell>
                            </TableRow>
                        ))
                    }
                </TableBody>
            </Table>
            <Chatbot />

            <Dialog open={openTrack} onOpenChange={setOpenTrack}>
                <DialogContent className="sm:max-w-[425px] bg-white text-black">
                    <DialogHeader>
                        <DialogTitle>Track Application</DialogTitle>
                    </DialogHeader>
                    {selectedJob && selectedJob.trackingSteps && (
                        <div className="flex flex-col gap-4">
                            <Tracker steps={selectedJob.trackingSteps} currentStep={selectedJob.currentStep} />
                        </div>
                    )}
                    {selectedJob && !selectedJob.trackingSteps && (
                        <div className="text-center text-gray-500">
                            Tracking details not available.
                        </div>
                    )}
                </DialogContent>
            </Dialog>
        </div>
    )
}

export default AppliedJobTable