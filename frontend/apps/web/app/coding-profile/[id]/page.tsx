'use client';
import React, { useState, useEffect } from 'react';
import LeetCodeCard from '../../../components/codingProfile/Leetcode';
import GitHubCard from '../../../components/codingProfile/Github';
import { userDataAPI } from '../../../services/api';
import toast from 'react-hot-toast';

const CodingProfile = () => {
    const [activeTab, setActiveTab] = useState('LeetCode');

    // Separate input and saved state
    const [inputLeetCode, setInputLeetCode] = useState('');
    const [savedLeetCode, setSavedLeetCode] = useState('');

    const [inputGitHub, setInputGitHub] = useState('');
    const [savedGitHub, setSavedGitHub] = useState('');

    const [resumeFile, setResumeFile] = useState<File | null>(null);
    const [savedResumeUrl, setSavedResumeUrl] = useState('');

    const [inputPortfolio, setInputPortfolio] = useState('');
    const [savedPortfolioUrl, setSavedPortfolioUrl] = useState('');

    const [loading, setLoading] = useState(true);

    const tabClasses = (tab: string) =>
        `cursor-pointer px-4 py-2 font-medium border-b-2 ${activeTab === tab
            ? 'border-blue-600 text-blue-600'
            : 'border-transparent text-gray-600 hover:text-blue-500'
        }`;

    // Fetch existing data on mount
    useEffect(() => {
        const fetchProfile = async () => {
            try {
                const res = await userDataAPI.getCodingProfile();
                if (res.data) {
                    const { leetcodeUsername, githubUsername, portfolioUrl, resume } = res.data;
                    if (leetcodeUsername) setSavedLeetCode(leetcodeUsername);
                    if (githubUsername) setSavedGitHub(githubUsername);
                    if (portfolioUrl) setSavedPortfolioUrl(portfolioUrl);
                    if (resume) setSavedResumeUrl(resume);
                }
            } catch (err) {
                console.error(err);
                toast.error('Failed to load profile');
            } finally {
                setLoading(false);
            }
        };
        fetchProfile();
    }, []);

    const handleSaveField = async (field: string) => {
        try {
            const formData = new FormData();

            switch (field) {
                case 'LeetCode':
                    if (!inputLeetCode.trim()) return toast.error('Please enter a LeetCode username');
                    formData.append('leetcodeUsername', inputLeetCode);
                    await userDataAPI.createCodingProfile(formData);
                    setSavedLeetCode(inputLeetCode);
                    setInputLeetCode('');
                    toast.success('LeetCode username saved!');
                    break;

                case 'GitHub':
                    if (!inputGitHub.trim()) return toast.error('Please enter a GitHub username');
                    formData.append('githubUsername', inputGitHub);
                    await userDataAPI.createCodingProfile(formData);
                    setSavedGitHub(inputGitHub);
                    setInputGitHub('');
                    toast.success('GitHub username saved!');
                    break;

                case 'Resume':
                    if (!resumeFile && !savedResumeUrl) return toast.error('Please upload your resume');
                    if (resumeFile) formData.append('resume', resumeFile);
                    await userDataAPI.createCodingProfile(formData);
                    if (resumeFile) setSavedResumeUrl(URL.createObjectURL(resumeFile));
                    setResumeFile(null);
                    toast.success('Resume saved!');
                    break;

                case 'Portfolio':
                    if (!inputPortfolio.trim()) return toast.error('Please enter your portfolio URL');
                    formData.append('portfolioUrl', inputPortfolio);
                    await userDataAPI.createCodingProfile(formData);
                    setSavedPortfolioUrl(inputPortfolio);
                    setInputPortfolio('');
                    toast.success('Portfolio URL saved!');
                    break;
            }
        } catch (err) {
            console.error(err);
            toast.error('Failed to save field');
        }
    };

    if (loading) return <p>Loading...</p>;

    return (
        <div className="mt-20 mx-auto max-w-5xl px-6">
            <h1 className="text-3xl font-bold mb-2">Coding Profile</h1>
            <p className="text-gray-600 mb-8">
                Manage your coding platform links and showcase your developer journey.
            </p>

            {/* Tabs */}
            <div className="flex justify-between border-b mb-8 space-x-6">
                {['LeetCode', 'GitHub', 'Resume', 'Portfolio'].map((tab) => (
                    <div key={tab} className={tabClasses(tab)} onClick={() => setActiveTab(tab)}>
                        {tab}
                    </div>
                ))}
            </div>

            {/* Tab Content */}
            <div className="grid grid-cols-1 gap-6">
                {/* LeetCode */}
                {activeTab === 'LeetCode' && (
                    <div className="bg-gradient-to-br p-6 rounded-lg text-black">
                        {!savedLeetCode ? (
                            <>
                                <input
                                    type="text"
                                    placeholder="LeetCode Username"
                                    className="w-full px-3 py-2 rounded border"
                                    value={inputLeetCode}
                                    onChange={(e) => setInputLeetCode(e.target.value)}
                                />
                                <button
                                    className="mt-3 px-4 py-2 bg-black text-white rounded hover:bg-blue-700 transition"
                                    onClick={() => handleSaveField('LeetCode')}
                                >
                                    Save LeetCode
                                </button>
                            </>
                        ) : (
                            <LeetCodeCard username={savedLeetCode} />
                        )}
                    </div>
                )}

                {/* GitHub */}
                {activeTab === 'GitHub' && (
                    <div className="bg-gradient-to-br p-6 rounded-lg text-black">
                        {!savedGitHub ? (
                            <>
                                <input
                                    type="text"
                                    placeholder="GitHub Username"
                                    className="w-full px-3 py-2 rounded border"
                                    value={inputGitHub}
                                    onChange={(e) => setInputGitHub(e.target.value)}
                                />
                                <button
                                    className="mt-3 px-4 py-2 bg-black text-white rounded hover:bg-blue-700 transition"
                                    onClick={() => handleSaveField('GitHub')}
                                >
                                    Save GitHub
                                </button>
                            </>
                        ) : (
                            <GitHubCard username={savedGitHub} />
                        )}
                    </div>
                )}

                {/* Resume */}
                {activeTab === 'Resume' && (
                    <div className="bg-gradient-to-br p-6 rounded-lg text-black">
                        {!savedResumeUrl ? (
                            <>
                                <input
                                    type="file"
                                    accept="application/pdf"
                                    className="w-full px-3 py-2 rounded border"
                                    onChange={(e: any) => setResumeFile(e.target.files[0])}
                                />
                                <button
                                    className="mt-3 px-4 py-2 bg-black text-white rounded hover:bg-blue-700 transition"
                                    onClick={() => handleSaveField('Resume')}
                                >
                                    Save Resume
                                </button>
                            </>
                        ) : (
                            <object
                                data={savedResumeUrl}
                                type="application/pdf"
                                width="100%"
                                height="600px"
                                className="rounded border mt-3"
                            >
                                <p>
                                    Your PDF cannot be displayed.{' '}
                                    <a href={savedResumeUrl} target="_blank" className="text-blue-600 underline">
                                        Download it
                                    </a>
                                </p>
                            </object>
                        )}
                    </div>
                )}

                {/* Portfolio */}
                {activeTab === 'Portfolio' && (
                    <div className="bg-white p-6 rounded-xl text-black">
                        {!savedPortfolioUrl ? (
                            <>
                                <input
                                    type="text"
                                    placeholder="Enter Portfolio URL"
                                    className="w-full px-4 py-2 rounded-lg border border-gray-300  focus:outline-none"
                                    value={inputPortfolio}
                                    onChange={(e) => setInputPortfolio(e.target.value)}
                                />
                                <button
                                    className="mt-4 px-5 py-2 bg-black text-white font-medium rounded-lg hover:bg-gray-700 transition-colors shadow"
                                    onClick={() => handleSaveField('Portfolio')}
                                >
                                    Save Portfolio
                                </button>
                            </>
                        ) : (
                            <div className="mt-4 flex items-center justify-between bg-gray-100 p-4 rounded-lg shadow-sm">
                                <span className="truncate text-gray-800 font-medium">{savedPortfolioUrl}</span>
                                <a
                                    href={savedPortfolioUrl}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="text-blue-600 font-medium hover:underline"
                                >
                                    Visit
                                </a>
                            </div>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
};

export default CodingProfile;
