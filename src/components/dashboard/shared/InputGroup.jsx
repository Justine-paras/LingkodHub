import React from "react";

export const InputGroup = ({ label, children, helper }) => (
  <div className="flex flex-col gap-2 w-full">
    <label className="text-sm font-medium text-brand-text-main">{label}</label>
    {children}
    {helper && (
      <p className="text-[10px] italic text-brand-text-variant/60">{helper}</p>
    )}
  </div>
);
