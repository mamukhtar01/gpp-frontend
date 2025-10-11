"use client";
import React from "react";
import { Input } from "@/components/ui/input";

interface InputColProps extends React.HTMLAttributes<HTMLDivElement> {
  label: string;
  value: string | number;
  id: string;
  placeholder: string;
  isDisabled?: boolean;
  onChange?: (e: React.ChangeEvent<HTMLInputElement>) => void;
}
export const InputCol: React.FC<InputColProps> = ({
  label,
  id,
  value,
  placeholder,
  isDisabled = true,
  onChange = () => {},
  ...props
}) => (
  <div className="flex gap-4 w-full max-w-sm my-6">
    <label htmlFor={id} className="font-medium">
      {label}
    </label>
    <Input
      type="text"
      id={id}
      disabled={isDisabled}
      placeholder={placeholder}
      value={value}
      onChange={onChange}
      {...props}
    />
  </div>
);