import { BriefcaseBusiness, Globe, Linkedin, Mail, MapPin, Phone, User } from 'lucide-react'
import React from 'react'

const PersonalinfoForm = ({ data, onChange }) => {

    const handleChange = (field, value) => {
        onChange({ ...data, [field]: value })
    }

    const fields = [
        { key: "full_name", label: "Full Name", icon: User, type: "text", required: true },
        { key: "email", label: "Email Address", icon: Mail, type: "email", required: true },
        { key: "phone", label: "Phone Number", icon: Phone, type: "tel" },
        { key: "location", label: "Location", icon: MapPin, type: "text" },
        { key: "profession", label: "Profession", icon: BriefcaseBusiness, type: "text" },
        { key: "linkedin", label: "LinkedIn Profile", icon: Linkedin, type: "url" },
        { key: "website", label: "Personal Website", icon: Globe, type: "url" },
    ]

    return (
        <div className='space-y-6'>
            <div>
                <h3 className='text-lg font-semibold text-gray-900'>Personal Information</h3>
                <p className='text-sm text-gray-600'>Get Started with the personal information</p>
                <div className='flex justify-center'>
                    <label className='flex flex-col items-center gap-2 mt-5 text-slate-600 hover:text-slate-700 cursor-pointer'>
                        {data.image ? (
                            <img src={typeof data.image === 'string' ? data.image : URL.createObjectURL(data.image)} alt='user-image' className='w-24 h-24 rounded-full object-cover ring ring-slate-300 hover:opacity-80 transition-opacity' />
                        ) : (
                            <div className='flex flex-col items-center gap-2 p-6 border-2 border-dashed border-slate-300 rounded-full hover:border-slate-400 transition-colors'>
                                <User className='size-10' />
                                <span className='text-xs font-medium'>Upload Photo</span>
                            </div>
                        )}
                        <input type='file' accept='image/jpeg, image/png' className='hidden' onChange={(e) => handleChange("image", e.target.files[0])} />
                    </label>
                </div>
            </div>

            <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
                {fields.map((field) => {
                    const Icon = field.icon;
                    return (
                        <div key={field.key} className='space-y-1'>
                            <label className='flex items-center gap-2 text-sm font-medium text-gray-700'>
                                <Icon className="size-4" />
                                {field.label}
                                {field.required && <span className='text-red-500'>*</span>}
                            </label>
                            <input
                                type={field.type}
                                value={data[field.key] || ""}
                                onChange={(e) => handleChange(field.key, e.target.value)}
                                className='w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all text-sm'
                                placeholder={`Enter your ${field.label.toLowerCase()}`}
                                required={field.required}
                            />
                        </div>
                    )
                })}
            </div>
        </div>
    )
}

export default PersonalinfoForm