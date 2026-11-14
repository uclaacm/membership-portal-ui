import type { SelectHTMLAttributes } from "react";
import Config from "@/lib/config";

type MajorSelectorProps = Omit<SelectHTMLAttributes<HTMLSelectElement>, "children"> & {
  showPlaceholder?: boolean;
};

const prioritizedMajors = [...new Set(Config.prioritizedMajors)];
const remainingMajors = Config.majors
  .filter(major => !prioritizedMajors.includes(major))
  .sort((a, b) => a.localeCompare(b, "en"));

export default function MajorSelector({ showPlaceholder = false, name = "major", ...props }: MajorSelectorProps) {
  return (
    <select name={name} {...props}>
      {showPlaceholder && <option value="">--</option>}
      {prioritizedMajors.map(major => <option key={major} value={major}>{major}</option>)}
      {prioritizedMajors.length > 0 && remainingMajors.length > 0 && <hr />}
      {remainingMajors.map(major => <option key={major} value={major}>{major}</option>)}
    </select>
  );
}
