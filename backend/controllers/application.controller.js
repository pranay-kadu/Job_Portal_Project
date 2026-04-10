import { Application } from "../models/application.model.js";
import { Job } from "../models/job.model.js";
import axios from "axios";
import stream from "stream";

export const applyJob = async (req, res) => {
  try {
    const userId = req.id;
    const jobId = req.params.id;
    if (!jobId) {
      return res.status(400).json({
        message: "Job id is required.",
        success: false,
      });
    }
    // check if the user has already applied for the job
    const existingApplication = await Application.findOne({
      job: jobId,
      applicant: userId,
    });

    if (existingApplication) {
      return res.status(400).json({
        message: "You have already applied for this jobs",
        success: false,
      });
    }

    // check if the jobs exists
    const job = await Job.findById(jobId);
    if (!job) {
      return res.status(404).json({
        message: "Job not found",
        success: false,
      });
    }
    // create a new application
    const newApplication = await Application.create({
      job: jobId,
      applicant: userId,
    });

    job.applications.push(newApplication._id);
    await job.save();
    return res.status(201).json({
      message: "Job applied successfully.",
      success: true,
    });
  } catch (error) {
    console.log(error);
    return res.status(500).json({
      message: "An error occurred while applying for the job.",
      success: false,
    });
  }
};
export const getAppliedJobs = async (req, res) => {
  try {
    const userId = req.id;
    const application = await Application.find({ applicant: userId })
      .sort({ createdAt: -1 })
      .populate({
        path: "job",
        options: { sort: { createdAt: -1 } },
        populate: {
          path: "company",
          options: { sort: { createdAt: -1 } },
        },
      });
    if (!application) {
      return res.status(404).json({
        message: "No Applications",
        success: false,
      });
    }
    return res.status(200).json({
      application,
      success: true,
    });
  } catch (error) {
    console.log(error);
    return res.status(500).json({
      message: "An error occurred while fetching applied jobs.",
      success: false,
    });
  }
};
// admin dekhega kitna user ne apply kiya hai
export const getApplicants = async (req, res) => {
  try {
    const jobId = req.params.id;
    const job = await Job.findById(jobId).populate({
      path: "applications",
      options: { sort: { createdAt: -1 } },
      populate: {
        path: "applicant",
      },
    });
    if (!job) {
      return res.status(404).json({
        message: "Job not found.",
        success: false,
      });
    }
    return res.status(200).json({
      job,
      succees: true,
    });
  } catch (error) {
    console.log(error);
    return res.status(500).json({
      message: "An error occurred while fetching applicants.",
      success: false,
    });
  }
};
export const updateStatus = async (req, res) => {
  try {
    const { status } = req.body;
    const applicationId = req.params.id;
    if (!status) {
      return res.status(400).json({
        message: "status is required",
        success: false,
      });
    }

    // find the application by applicantion id
    const application = await Application.findOne({ _id: applicationId });
    if (!application) {
      return res.status(404).json({
        message: "Application not found.",
        success: false,
      });
    }

    // update the status
    application.status = status.toLowerCase();
    
    if (application.status === 'accepted') {
        application.trackingSteps = [
            { name: "Resume Scanning", status: "pending" },
            { name: "Shortlisted", status: "pending" },
            { name: "Interview Scheduled", status: "pending" },
            { name: "Final Selection", status: "pending" }
        ];
        application.currentStep = 0;
    }

    await application.save();

    return res.status(200).json({
      message: "Status updated successfully.",
      success: true,
    });
  } catch (error) {
    console.log(error);
    return res.status(500).json({
      message: "An error occurred while updating status.",
      success: false,
    });
  }
};

export const updateApplicationStep = async (req, res) => {
    try {
        const { stepIndex, status } = req.body; // status: 'completed'
        const applicationId = req.params.id;

        const application = await Application.findOne({ _id: applicationId });
        if (!application) {
            return res.status(404).json({
                message: "Application not found.",
                success: false
            });
        }

        if (stepIndex < 0 || stepIndex >= application.trackingSteps.length) {
             return res.status(400).json({
                message: "Invalid step index",
                success: false
            });
        }

        // Update the specific step
        application.trackingSteps[stepIndex].status = status;
        application.trackingSteps[stepIndex].date = new Date(); // Track completion time

        // If completed, move currentStep pointer
        if (status === 'completed' && stepIndex === application.currentStep) {
             // Only increment if not already at the last step
             if(application.currentStep < application.trackingSteps.length){
                 application.currentStep += 1;
             }

             // Check if "Final Selection" is completed
             if (application.trackingSteps[stepIndex].name === "Final Selection") {
                 const job = await Job.findById(application.job);
                 if (job && job.position > 0) {
                     job.position -= 1;
                     await job.save();
                 }
             }
        }
        
        await application.save();

        return res.status(200).json({
            message: "Step updated successfully.",
            success: true,
            application
        });

    } catch (error) {
        console.log(error);
        return res.status(500).json({
            message: "Internal server error",
            success: false
        });
    }
};

export const generateApplicationPDF = async (req, res) => {
  try {
    const { id } = req.params;

    // Fetch applicant data from DB
    const application = await Application.findById(id).populate("user");

    if (!application) {
      return res.status(404).json({ message: "Application not found" });
    }

    // Response Headers for PDF
    res.setHeader("Content-Type", "application/pdf");
    res.setHeader(
      "Content-Disposition",
      `attachment; filename="${application.user.fullname}.pdf"`,
    );

    // Create PDF
    const doc = new PDFDocument();
    doc.pipe(res);

    // Title
    doc
      .fontSize(22)
      .text("Applicant Details", { underline: true, align: "center" });
    doc.moveDown(1);

    // Student Details
    doc.fontSize(14).text(`Name: ${application.user.fullname}`);
    doc.text(`Email: ${application.user.email}`);
    doc.text(`Phone: ${application.user.phone}`);
    doc.text(`Address: ${application.user.address || "N/A"}`);
    doc.moveDown();

    // Job Details
    doc.fontSize(16).text("Applied Job Details", { underline: true });
    doc.fontSize(14).text(`Job Title: ${application.jobTitle}`);
    doc.text(`Company Name: ${application.companyName}`);
    doc.text(`Status: ${application.status}`);
    doc.text(`Applied Date: ${application.createdAt.toDateString()}`);
    doc.moveDown();

    // Education
    doc.fontSize(16).text("Education", { underline: true });
    application.user.education.forEach((edu) => {
      doc.fontSize(14).text(`• ${edu.degree} at ${edu.college} (${edu.year})`);
    });
    doc.moveDown();

    // Skills
    doc.fontSize(16).text("Skills", { underline: true });
    doc.fontSize(14).text(application.user.skills.join(", "));

    doc.end();
  } catch (error) {
    console.log("PDF Error:", error);
    res.status(500).json({ message: "PDF generation failed" });
  }
};

export const downloadResume = async (req, res) => {
  try {
    const applicationId = req.params.id;
    const application = await Application.findById(applicationId).populate({
      path: "applicant",
    });

    if (!application) {
      return res
        .status(404)
        .json({ message: "Application not found.", success: false });
    }

    const resumeUrl = application.applicant?.profile?.resume;
    const originalName =
      application.applicant?.profile?.resumeOriginalName || "resume.pdf";

    if (!resumeUrl) {
      return res
        .status(404)
        .json({ message: "Resume not found.", success: false });
    }

    const resp = await axios.get(resumeUrl, { responseType: "stream" });

    // Forward content-type and force attachment with original filename
    res.setHeader(
      "Content-Type",
      resp.headers["content-type"] || "application/octet-stream",
    );
    res.setHeader(
      "Content-Disposition",
      `attachment; filename="${originalName.replace(/\"/g, "")}"`,
    );

    // Pipe the remote stream to the response
    resp.data.pipe(res);
  } catch (error) {
    console.error("Download resume error:", error.message || error);
    return res
      .status(500)
      .json({ message: "Could not download resume.", success: false });
  }
};

export const deleteApplication = async (req, res) => {
    try {
        const applicationId = req.params.id;
        const application = await Application.findById(applicationId);
        
        if (!application) {
            return res.status(404).json({
                message: "Application not found.",
                success: false
            });
        }

        // Soft Delete: Mark as rejected for student
        application.status = 'rejected';
        await application.save();

        // Remove from Job's application list for recruiter
        const job = await Job.findById(application.job);
        if (job) {
            job.applications = job.applications.filter(appId => appId.toString() !== applicationId);
            await job.save();
        }
        
        // Do not hard delete, so student can see "Rejected" status
        // await Application.findByIdAndDelete(applicationId);

        return res.status(200).json({
            message: "Application deleted successfully.",
            success: true
        });

    } catch (error) {
        console.log(error);
        return res.status(500).json({
            message: "Internal server error",
            success: false
        });
    }
};
