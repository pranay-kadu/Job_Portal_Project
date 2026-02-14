import React from 'react'
import { Popover, PopoverContent, PopoverTrigger } from '../ui/popover'
import { Button } from '../ui/button'
import { Avatar, AvatarImage } from '../ui/avatar'
import { LogOut, User2 } from 'lucide-react'
import { Link, useNavigate } from 'react-router-dom'
import { useDispatch, useSelector } from 'react-redux'
import axios from 'axios'
import { USER_API_END_POINT } from '@/utils/constant'
import { setUser } from '@/redux/authSlice'
import { toast } from 'sonner'

const Navbar = () => {
    const { user } = useSelector(store => store.auth);
    const dispatch = useDispatch();
    const navigate = useNavigate();

    const logoutHandler = async () => {
        try {
            const res = await axios.get(`${USER_API_END_POINT}/logout`, { withCredentials: true });
            if (res.data.success) {
                dispatch(setUser(null));
                navigate("/");
                toast.success(res.data.message);
            }
        } catch (error) {
            console.log(error);
            toast.error(error.response.data.message);
        }
    }

    return (
        <div className="bg-gray-100 backdrop-blur-md sticky top-0 z-50 shadow-sm ">
            <div className="flex items-center justify-between mx-auto max-w-7xl px-6 h-16">

           
                <Link to="/" className="flex items-center gap-1">
                    <h1 className="text-2xl font-bold tracking-tight">
                        <span className="text-[#080a92]">AI Based</span> Smart Placement Portal System
                    </h1>
                </Link>

                <div className="flex items-center gap-10">

                    <ul className="hidden md:flex font-medium items-center gap-8 text-gray-700">
                        {user && user.role === 'recruiter' ? (
                            <>
                                <li className="hover:text-[#0052CC] transition"><Link to="/admin/companies">Companies</Link></li>
                                <li className="hover:text-[#0052CC] transition"><Link to="/admin/jobs">Jobs</Link></li>
                            </>
                        ) : (
                            <>
                                <li className="hover:text-[#0052CC] transition"><Link to="/">Home</Link></li>
                                <li className="hover:text-[#0052CC] transition"><Link to="/jobs">Jobs</Link></li>
                                <li className="hover:text-[#0052CC] transition"><Link to="/browse">Browse</Link></li>
                                <li className="hover:text-[#0052CC] transition"><Link to="/resumeparser">Resume Parser</Link></li>
                            </>
                        )}
                    </ul>

                    
                    {!user ? (
                        <div className="flex items-center gap-3">
                            <Link to="/login">
                                <Button variant="outline" className="hover:bg-gray-100 transition">Login</Button>
                            </Link>
                            <Link to="/signup">
                                <Button className="bg-[#0052CC] hover:bg-[#003FA3] transition text-white">
                                    Signup
                                </Button>
                            </Link>
                        </div>
                    ) : (
                        <Popover>
                            <PopoverTrigger asChild>
                                <Avatar className="cursor-pointer border shadow-sm hover:shadow-md transition">
                                    <AvatarImage src={user?.profile?.profilePhoto} alt="profile" />
                                </Avatar>
                            </PopoverTrigger>

                            <PopoverContent className="w-80 p-5 rounded-xl shadow-lg bg-white border">
                                <div className="flex gap-3 items-center">
                                    <Avatar className="border shadow-sm">
                                        <AvatarImage src={user?.profile?.profilePhoto} alt="profile" />
                                    </Avatar>
                                    <div>
                                        <h4 className="font-semibold text-gray-900">{user?.fullname}</h4>
                                        <p className="text-sm text-gray-500">{user?.profile?.bio}</p>
                                    </div>
                                </div>

                                <div className="flex flex-col mt-4 gap-3 text-gray-600">

                                    {user.role === 'student' && (
                                        <div className="flex items-center gap-2 hover:text-[#0052CC] cursor-pointer transition">
                                            <User2 size={18} />
                                            <Link to="/profile">
                                                <Button variant="link" className="p-0">View Profile</Button>
                                            </Link>
                                        </div>
                                    )}

                                    <div className="flex items-center gap-2 hover:text-red-600 cursor-pointer transition">
                                        <LogOut size={18} />
                                        <Button onClick={logoutHandler} variant="link" className="text-red-600 p-0">
                                            Logout
                                        </Button>
                                    </div>
                                </div>
                            </PopoverContent>
                        </Popover>
                    )}
                </div>
            </div>
        </div>
    );
};

export default Navbar;
