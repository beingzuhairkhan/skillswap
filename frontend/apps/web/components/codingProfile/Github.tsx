import React, { useEffect, useState } from "react";

interface GitHubCardProps {
  username: string;
}

interface GitHubData {
  login: string;
  name: string | null;
  avatar_url: string;
  public_repos: number;
  followers: number;
  following: number;
  public_gists: number;
}

const GitHubCard: React.FC<GitHubCardProps> = ({ username }) => {
  const [data, setData] = useState<GitHubData | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string>("");

  useEffect(() => {
    if (!username) return;

    setLoading(true);
    fetch(`https://api.github.com/users/${username}`)
      .then((res) => {
        if (!res.ok) throw new Error("User not found");
        return res.json();
      })
      .then((userData: GitHubData) => {
        setData(userData);
        setError("");
      })
      .catch((err) => {
        setError(err.message);
        setData(null);
      })
      .finally(() => setLoading(false));
  }, [username]);
 if (loading)
    return (
      <div className="flex  justify-center items-center">
        <div className="w-16 h-16 border-4 border-blue-500 border-dashed rounded-full animate-spin"></div>
      </div>

    );

  if (error)
    return (
      <p className="text-red-500 text-center py-8 font-semibold w-full">
        {error}
      </p>
    );

  const circleRadius = 50;
  const circleCircumference = 2 * Math.PI * circleRadius;

  const getStrokeDashOffset = (value: number, max: number) => {
    const percent = Math.min((value / max) * 100, 100);
    return circleCircumference - (circleCircumference * percent) / 100;
  };

  const maxValues = {
    public_repos: 100,
    followers: 1000,
    following: 500,
    public_gists: 50,
  };

  return (
    data && (
      <div className="w-full  p-6 rounded-2xl  text-gray-800">
        {/* Header */}
        <div className="flex flex-col sm:flex-row items-center sm:items-start sm:space-x-6">
          <img
            src={data.avatar_url}
            alt={`${data.login} avatar`}
            className="w-28 h-28 sm:w-36 sm:h-36 rounded-full border-4 border-gray-300 object-cover"
          />
          <div className="mt-4 sm:mt-0 text-center sm:text-left">
            <h2 className="text-2xl sm:text-3xl font-bold">{data.name || data.login}</h2>
            <p className="text-gray-500">@{data.login}</p>
          </div>
        </div>

        {/* Circular Stats */}
        <div className="mt-8 grid grid-cols-2 sm:grid-cols-4 gap-8 justify-items-center">
          {[
            { label: "Repos", value: data.public_repos, max: maxValues.public_repos, color: "#A78BFA" },
            { label: "Followers", value: data.followers, max: maxValues.followers, color: "#4ADE80" },
            { label: "Following", value: data.following, max: maxValues.following, color: "#60A5FA" },
            { label: "Gists", value: data.public_gists, max: maxValues.public_gists, color: "#FACC15" },
          ].map((stat) => (
            <div key={stat.label} className="flex flex-col items-center">
              <div className="relative w-28 h-28">
                <svg width="100%" height="100%" viewBox="0 0 120 120">
                  <circle
                    cx="60"
                    cy="60"
                    r={circleRadius}
                    stroke="#E5E7EB"
                    strokeWidth="10"
                    fill="none"
                  />
                  <circle
                    cx="60"
                    cy="60"
                    r={circleRadius}
                    stroke={stat.color}
                    strokeWidth="10"
                    fill="none"
                    strokeLinecap="round"
                    strokeDasharray={circleCircumference}
                    strokeDashoffset={getStrokeDashOffset(stat.value, stat.max)}
                    className="transition-all duration-700"
                  />
                </svg>
                <div className="absolute inset-0 flex flex-col justify-center items-center text-gray-700 font-semibold">
                  <span className="text-lg">{stat.value}</span>
                  <span className="text-sm text-gray-500">{stat.label}</span>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Profile Link */}
        <div className="text-center mt-8">
          <a
            href={`https://github.com/${username}`}
            target="_blank"
            rel="noopener noreferrer"
            className="px-6 py-2 bg-gray-800 text-white hover:bg-gray-900 rounded-full font-semibold transition"
          >
            Visit GitHub Profile
          </a>
        </div>
      </div>
    )
  );
};

export default GitHubCard;
