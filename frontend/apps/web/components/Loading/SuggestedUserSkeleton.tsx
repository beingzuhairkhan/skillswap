const SuggestedUserSkeleton = () => {
  return (
    <div className="flex items-center justify-between bg-gray-50 p-3.5 rounded-xl border border-gray-200 animate-pulse">
      <div className="flex items-center space-x-3 flex-1 min-w-0">
        {/* Avatar */}
        <div className="w-12 h-12 rounded-xl bg-gray-300" />

        {/* Text */}
        <div className="flex-1 space-y-2">
          <div className="h-3 w-32 bg-gray-300 rounded" />
          <div className="h-2.5 w-44 bg-gray-200 rounded" />
        </div>
      </div>

      {/* Follow button */}
      <div className="w-9 h-9 rounded-xl bg-gray-300" />
    </div>
  );
};

export default SuggestedUserSkeleton;
