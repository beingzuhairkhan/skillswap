import { Clipboard, Video } from "lucide-react";
import { toast } from "react-hot-toast";

const CopyMeetLinkButton = ({ googleMeetLink }: { googleMeetLink: string }) => {

  const handleCopy = () => {
    navigator.clipboard.writeText(googleMeetLink);
    toast.success("Meet link copied!"); 
  };

  return (
    <button
      onClick={handleCopy}
      className="flex w-full items-center justify-center gap-2 bg-gray-900 hover:bg-gray-800 text-white font-semibold py-2.5 px-4 rounded-md text-sm transition-colors"
    >
      <Video className="w-4 h-4" />
      Copy Meet Link
      <Clipboard className="w-3 h-3" />
    </button>
  );
};

export default CopyMeetLinkButton;
