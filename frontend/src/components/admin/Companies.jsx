import React, { useEffect, useState } from 'react'
import Navbar from '../shared/Navbar'
import { Input } from '../ui/input'
import { Button } from '../ui/button'
import CompaniesTable from './CompaniesTable'
import { useNavigate } from 'react-router-dom'
import useGetAllCompanies from "../../hooks/useGetAllCompanies";
import { useDispatch } from 'react-redux'
import { setSearchCompanyByText } from '@/redux/companySlice'


import { COMPANY_API_END_POINT } from '@/utils/constant'
import axios from 'axios'
import { Building2, Users, BarChart } from 'lucide-react'

const Companies = () => {
  useGetAllCompanies();
  const [input, setInput] = useState("")
  const [stats, setStats] = useState({ totalStudents: 0, totalCompanies: 0, placedStudents: 0 });
  const navigate = useNavigate();
  const dispatch = useDispatch();

  useEffect(() => {
    dispatch(setSearchCompanyByText(input));
  }, [input]);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const res = await axios.get(`${COMPANY_API_END_POINT}/stats`, { withCredentials: true });
        if (res.data.success) {
          setStats(res.data);
        }
      } catch (error) {
        console.log(error);
      }
    }
    fetchStats();
  }, []);

  return (
    <div>
      <Navbar />
      <div className='max-w-6xl mx-auto my-10'>

        <div className="flex gap-4 mb-5">
          <div className="flex items-center gap-4 bg-white p-4 rounded-xl shadow-sm border border-gray-100 flex-1">
            <div className="p-3 bg-blue-100 rounded-lg">
              <Users className="w-6 h-6 text-blue-600" />
            </div>
            <div>
              <p className="text-sm text-gray-500 font-medium">Total Students</p>
              <h3 className="text-2xl font-bold text-gray-800">{stats.totalStudents}</h3>
            </div>
          </div>

          <div className="flex items-center gap-4 bg-white p-4 rounded-xl shadow-sm border border-gray-100 flex-1">
            <div className="p-3 bg-indigo-100 rounded-lg">
              <Building2 className="w-6 h-6 text-indigo-600" />
            </div>
            <div>
              <p className="text-sm text-gray-500 font-medium">Total Companies</p>
              <h3 className="text-2xl font-bold text-gray-800">{stats.totalCompanies}</h3>
            </div>
          </div>

          <div className="flex items-center gap-4 bg-white p-4 rounded-xl shadow-sm border border-gray-100 flex-1">
            <div className="p-3 bg-emerald-100 rounded-lg">
              <BarChart className="w-6 h-6 text-emerald-600" />
            </div>
            <div>
              <p className="text-sm text-gray-500 font-medium">Placement Report</p>
              <h3 className="text-2xl font-bold text-gray-800">{stats.placementRate}%</h3>
            </div>
          </div>
        </div>

        <div className='flex items-center justify-between my-5'>
          <Input
            className="w-fit"
            placeholder="Filter by Name"
            onChange={(e) => setInput(e.target.value)}
          />
          <Button onClick={() => navigate("/admin/companies/create")} className="bg-blue-900 text-white cursor-pointer">New Company</Button>
        </div>
        <CompaniesTable />
      </div>
    </div>
  )
}

export default Companies
