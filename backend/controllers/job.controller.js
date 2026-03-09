import { Job } from "../models/job.model.js";

// admin post krega job
export const postJob = async (req, res) => {
  try {
    const {
      title,
      description,
      requirements,
      salary,
      location,
      jobType,
      experience,
      position,
      companyId,
    } = req.body;
    const userId = req.id;

    if (
      !title ||
      !description ||
      !requirements ||
      !salary ||
      !location ||
      !jobType ||
      !experience ||
      !position ||
      !companyId
    ) {
      return res.status(400).json({
        message: "Somethin is missing.",
        success: false,
      });
    }
    // sanitize and validate numeric fields
    const cleanedSalary = Number(String(salary).replace(/[^0-9.-]+/g, ""));
    if (!Number.isFinite(cleanedSalary)) {
      return res
        .status(400)
        .json({ message: "Invalid salary value.", success: false });
    }

    const positionNum = Number(position);
    if (!Number.isInteger(positionNum) || positionNum < 0) {
      return res
        .status(400)
        .json({ message: "Invalid position value.", success: false });
    }

    const job = await Job.create({
      title,
      description,
      requirements: requirements.split(","),
      salary: cleanedSalary,
      location,
      jobType,
      experienceLevel: experience,
      position: positionNum,
      company: companyId,
      created_by: userId,
    });
    return res.status(201).json({
      message: "New job created successfully.",
      job,
      success: true,
    });
  } catch (error) {
    console.log(error);
  }
};
// student k liye
export const getAllJobs = async (req, res) => {
  try {
    const keyword = req.query.keyword || "";
    const query = {
      $or: [
        { title: { $regex: keyword, $options: "i" } },
        { description: { $regex: keyword, $options: "i" } },
      ],
    };
    const jobs = await Job.find(query)
      .populate({
        path: "company",
      })
      .sort({ createdAt: -1 });
    if (!jobs) {
      return res.status(404).json({
        message: "Jobs not found.",
        success: false,
      });
    }

    // Filter out jobs where the company has been deleted
    const validJobs = jobs.filter(job => job.company);

    return res.status(200).json({
      jobs: validJobs,
      success: true,
    });
  } catch (error) {
    console.log(error);
  }
};
// student
export const getJobById = async (req, res) => {
  try {
    const jobId = req.params.id;
    const job = await Job.findById(jobId).populate({
      path: "applications",
    });
    if (!job) {
      return res.status(404).json({
        message: "Jobs not found.",
        success: false,
      });
    }
    return res.status(200).json({ job, success: true });
  } catch (error) {
    console.log(error);
  }
};
// admin kitne job create kra hai abhi tk
export const getAdminJobs = async (req, res) => {
  try {
    const adminId = req.id;
    const jobs = await Job.find({ created_by: adminId }).populate({
      path: "company",
      createdAt: -1,
    });
    if (!jobs) {
      return res.status(404).json({
        message: "Jobs not found.",
        success: false,
      });
    }
    
    // Filter out jobs where the company has been deleted (orphan jobs)
    const validJobs = jobs.filter(job => job.company);

    return res.status(200).json({
      jobs: validJobs,
      success: true,
    });
  } catch (error) {
    console.log(error);
  }
};

// admin update job
export const updateJob = async (req, res) => {
  try {
    const jobId = req.params.id;
    const {
      title,
      description,
      requirements,
      salary,
      location,
      jobType,
      experience,
      position,
      companyId,
    } = req.body;

    const job = await Job.findById(jobId);
    if (!job) {
      return res
        .status(404)
        .json({ message: "Job not found.", success: false });
    }

    if (title) job.title = title;
    if (description) job.description = description;
    if (requirements) job.requirements = requirements.split(",");
    if (salary !== undefined) {
      const cleanedSalary = Number(String(salary).replace(/[^0-9.-]+/g, ""));
      if (!Number.isFinite(cleanedSalary)) {
        return res
          .status(400)
          .json({ message: "Invalid salary value.", success: false });
      }
      job.salary = cleanedSalary;
    }
    if (location) job.location = location;
    if (jobType) job.jobType = jobType;
    if (experience) job.experienceLevel = experience;
    if (position !== undefined) {
      const positionNum = Number(position);
      if (!Number.isInteger(positionNum) || positionNum < 0) {
        return res
          .status(400)
          .json({ message: "Invalid position value.", success: false });
      }
      job.position = positionNum;
    }
    if (companyId) job.company = companyId;

    await job.save();

    return res
      .status(200)
      .json({ message: "Job updated successfully.", job, success: true });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Update failed.", success: false });
  }
};
