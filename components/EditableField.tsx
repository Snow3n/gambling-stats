import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Edit, Check, X } from "lucide-react";
import { toast } from "sonner";

export interface EditableFieldProps {
  value: string;
  onSave: (fieldName: string, newValue: string) => void;
  fieldName: string;
  className?: string;
  prefix?: string;
  label?: string;
}

export function EditableField({
  value,
  onSave,
  fieldName,
  className = "",
  prefix = "",
  label,
}: EditableFieldProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [editValue, setEditValue] = useState(value);

  const handleSave = async () => {
    try {
      await onSave(fieldName, editValue);
      setIsEditing(false);
    } catch (error) {
      toast.error("Failed to save changes");
    }
  };

  const handleCancel = () => {
    setEditValue(value);
    setIsEditing(false);
  };

  if (isEditing) {
    return (
      <div className="flex items-center gap-2">
        <Input
          type="text"
          value={editValue}
          onChange={(e) => setEditValue(e.target.value)}
          className="h-7 text-sm"
          autoFocus
        />
        <Button
          variant="ghost"
          size="icon"
          onClick={handleSave}
          className="h-7 w-7"
        >
          <Check size={14} className="text-green-500" />
        </Button>
        <Button
          variant="ghost"
          size="icon"
          onClick={handleCancel}
          className="h-7 w-7"
        >
          <X size={14} className="text-red-500" />
        </Button>
      </div>
    );
  }

  return (
    <div className="group flex items-center gap-2 justify-end">
      <span className={className}>
        {label && <span className="text-gray-500 dark:text-gray-400 text-sm mr-1">{label}:</span>}
        {prefix}{value}
      </span>
      <Button
        variant="ghost"
        size="icon"
        onClick={() => setIsEditing(true)}
        className="h-7 w-7 opacity-0 group-hover:opacity-100 transition-opacity"
      >
        <Edit size={14} className="text-gray-500" />
      </Button>
    </div>
  );
} 