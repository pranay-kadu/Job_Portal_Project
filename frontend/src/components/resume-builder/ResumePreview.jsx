import React from 'react'
import ClassicTemplate from './templates/ClassicTemplate'
import ModernTemplate from './templates/ModernTemplate';
import MinimalTemplate from './templates/MinimalTemplate';
import MinimalImageTemplate from './templates/MinimalImageTemplate';

const ResumePreview = ({ data, template, accentColor, classes = "" }) => {

  const renderTemplate = () => {
    switch (template) {
      case "modern":
        return <ModernTemplate data={data} accentColor={accentColor} />;
      case "minimal":
        return <MinimalTemplate data={data} accentColor={accentColor} />;
      case "minimal-image":
        return <MinimalImageTemplate data={data} accentColor={accentColor} />;

      default:
        return <ClassicTemplate data={data} accentColor={accentColor} />;
    }
  }
  return (
    <div id='resume-preview' className={`w-full bg-white ${classes}`}>
      <table className="w-full border-none border-collapse m-0 p-0">
        <thead className="hidden print:table-header-group">
          <tr><td className="h-[15mm] p-0 m-0 border-none"></td></tr>
        </thead>
        <tbody className="p-0 m-0 border-none">
          <tr><td className="p-0 m-0 border-none">
            {renderTemplate()}
          </td></tr>
        </tbody>
        <tfoot className="hidden print:table-footer-group">
          <tr><td className="h-[15mm] p-0 m-0 border-none"></td></tr>
        </tfoot>
      </table>

      <style>
        {`
            @page {
              size: A4;
              margin: 0;
            }
            @media print {
              html, body {
                height: auto !important;
                background: white !important;
                overflow: visible !important;
              }
              body * {
                visibility: hidden;
              }
              #resume-preview, #resume-preview * {
                visibility: visible;
              }
              #resume-preview {
                position: absolute;
                left: 0;
                top: 0;
                width: 100% !important;
                margin: 0 !important;
                padding: 0 !important;
                box-sizing: border-box !important;
                border: none !important;
                box-shadow: none !important;
              }
              /* Prevent splitting sections */
              section, .experience-item, .project-item, .education-item {
                page-break-inside: avoid !important;
                break-inside: avoid !important;
              }
            }
            `}
      </style>
    </div>
  );
}


export default ResumePreview