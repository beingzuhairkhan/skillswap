'use client'

import axios from 'axios'
import React, { useEffect, useState } from 'react'
import { useAuth } from '../../contexts/AuthContext'

interface Job {
  _id: string
  title: string
  url: string
  type: string
  locationAddress: string
  department: string
  seniority: string
  createdAt: string
  skills_suggest: string[]
  descriptionBreakdown: {
    oneSentenceJobSummary: string
    keywords: string[]
    employmentType: string
    workModel: string
    salaryRangeMinYearly: number
    salaryRangeMaxYearly: number
    skillRequirements: string[]
  }
  owner: {
    _id: string
    companyName: string
    photo: string
    rating: string
    funding: string
    locationAddress: string
    teamSize: number
    sector: string
    slug: string
  }
}

interface User {
  name: string
  imageUrl: string
  skillsToTeach: string[]
  skillsToLearn: string[]
  domain: string
}

function getMatchScore(job: Job, user: User): number {
  const jobText = [
    ...(job.descriptionBreakdown?.keywords || []),
    ...(job.descriptionBreakdown?.skillRequirements || []),
    job.title,
    job.department || '',
  ].map(s => s.toLowerCase())

  const userSkills = [
    ...(user.skillsToTeach || []),
    ...(user.skillsToLearn || []),
    user.domain || '',
  ].map(s => s.toLowerCase())

  return userSkills.reduce((score, skill) => {
    return score + (jobText.some(t => t.includes(skill) || skill.includes(t)) ? 1 : 0)
  }, 0)
}

function getMatchedSkills(job: Job, user: User): string[] {
  const jobKeywords = (job.descriptionBreakdown?.keywords || []).map(k => k.toLowerCase())
  const userSkills = [...(user.skillsToTeach || []), ...(user.skillsToLearn || []), user.domain || '']
  return userSkills.filter(skill =>
    jobKeywords.some(k => k.includes(skill.toLowerCase()) || skill.toLowerCase().includes(k))
  )
}

function timeSince(dateStr: string) {
  const diff = Math.floor((Date.now() - new Date(dateStr).getTime()) / 1000)
  if (diff < 3600) return `${Math.floor(diff / 60)}m ago`
  if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`
  return `${Math.floor(diff / 86400)}d ago`
}

function formatSalary(min: number, max: number) {
  return `$${(min / 1000).toFixed(0)}k – $${(max / 1000).toFixed(0)}k`
}

function JobCard({ job, user, rank }: { job: Job; user: User; rank: number }) {
  const [expanded, setExpanded] = useState(false)
  const matchedSkills = getMatchedSkills(job, user)
  const hasSalary = job.descriptionBreakdown?.salaryRangeMinYearly && job.descriptionBreakdown?.salaryRangeMaxYearly

  return (
    <div className="group relative bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl overflow-hidden hover:shadow-lg hover:-translate-y-0.5 transition-all duration-200">
      {/* Top accent for top matches */}
      {rank === 0 && <div className="h-0.5 bg-gradient-to-r from-indigo-500 to-violet-400" />}
      {rank === 1 && <div className="h-0.5 bg-gradient-to-r from-sky-500 to-cyan-400" />}

      <div className="p-5">
        {/* Header */}
        <div className="flex gap-3 items-start">
          {/* Company logo */}
          <div className="w-11 h-11 rounded-xl border border-zinc-200 dark:border-zinc-700 overflow-hidden flex-shrink-0 bg-white flex items-center justify-center">
            {job.owner?.photo ? (
              <img src={job.owner.photo} alt={job.owner.companyName} className="w-full h-full object-contain" />
            ) : (
              <span className="text-lg font-bold text-indigo-500">{job.owner?.companyName?.[0] || '?'}</span>
            )}
          </div>

          {/* Title */}
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 flex-wrap mb-0.5">
              <span
                className="text-sm font-bold text-zinc-900 dark:text-zinc-100 leading-snug"
                dangerouslySetInnerHTML={{ __html: job.title }}
              />
              {rank === 0 && (
                <span className="text-[10px] font-bold tracking-wider bg-gradient-to-r from-indigo-500 to-violet-500 text-white rounded-full px-2 py-0.5">
                  TOP MATCH
                </span>
              )}
            </div>
            <div className="flex items-center gap-2 text-xs text-zinc-500 dark:text-zinc-400">
              <span className="font-medium">{job.owner?.companyName}</span>
              {job.owner?.rating && (
                <span className="text-amber-400 font-semibold">★ {job.owner.rating}</span>
              )}
            </div>
          </div>

          {/* Time */}
          <span className="text-[11px] text-zinc-400 dark:text-zinc-500 whitespace-nowrap mt-0.5 flex-shrink-0">
            {timeSince(job.createdAt)}
          </span>
        </div>

        {/* Meta pills */}
        <div className="flex flex-wrap gap-1.5 mt-3 mb-3">
          {[job.descriptionBreakdown?.workModel || job.type, job.locationAddress, job.seniority, job.department]
            .filter(Boolean)
            .map((label, i) => (
              <span
                key={i}
                className="text-[11px] text-zinc-500 dark:text-zinc-400 bg-zinc-100 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-md px-2.5 py-0.5"
              >
                {label}
              </span>
            ))}
          {hasSalary && (
            <span className="text-[11px] font-bold text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-900/20 border border-emerald-200 dark:border-emerald-800 rounded-md px-2.5 py-0.5">
              {formatSalary(job.descriptionBreakdown.salaryRangeMinYearly, job.descriptionBreakdown.salaryRangeMaxYearly)}
            </span>
          )}
        </div>

        {/* Summary */}
        {job.descriptionBreakdown?.oneSentenceJobSummary && (
          <p className="text-xs text-zinc-500 dark:text-zinc-400 leading-relaxed mb-3 line-clamp-2">
            {job.descriptionBreakdown.oneSentenceJobSummary}
          </p>
        )}

        {/* Matched skills */}
        {matchedSkills.length > 0 && (
          <div className="flex flex-wrap gap-1.5 mb-3 items-center">
            <span className="text-[11px] text-zinc-400">Matches:</span>
            {matchedSkills.map(skill => (
              <span
                key={skill}
                className="text-[11px] font-semibold text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-900/20 border border-indigo-200 dark:border-indigo-800 rounded-md px-2 py-0.5"
              >
                {skill}
              </span>
            ))}
          </div>
        )}

        {/* Expanded requirements */}
        {expanded && job.descriptionBreakdown?.skillRequirements && (
          <div className="bg-zinc-50 dark:bg-zinc-800/50 border border-zinc-200 dark:border-zinc-700 rounded-xl p-3 mb-3">
            <p className="text-[10px] font-bold uppercase tracking-wider text-zinc-400 mb-2">Requirements</p>
            <ul className="list-disc list-outside pl-4 space-y-1">
              {job.descriptionBreakdown.skillRequirements.map((req, i) => (
                <li key={i} className="text-xs text-zinc-600 dark:text-zinc-300 leading-snug">{req}</li>
              ))}
            </ul>
          </div>
        )}

        {/* Actions */}
        <div className="flex gap-2 mt-1">
          <a
            href={job.url}
            target="_blank"
            rel="noopener noreferrer"
            className="flex-1 text-center text-xs font-bold text-white bg-indigo-500 hover:bg-indigo-600 active:bg-indigo-700 rounded-lg py-2 transition-colors"
          >
            Apply Now →
          </a>
          <button
            onClick={() => setExpanded(p => !p)}
            className="text-xs font-semibold text-zinc-500 dark:text-zinc-400 bg-zinc-100 dark:bg-zinc-800 hover:bg-zinc-200 dark:hover:bg-zinc-700 border border-zinc-200 dark:border-zinc-700 rounded-lg px-3 py-2 transition-colors"
          >
            {expanded ? 'Less' : 'Details'}
          </button>
        </div>
      </div>
    </div>
  )
}

export default function JobsPage() {
  const { user } = useAuth() as { user: User }
  const [jobs, setJobs] = useState<Job[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    const fetchJobs = async () => {
      try {
        const response = await axios.get('https://api.joinrise.io/api/v1/jobs/public')
        const data = response.data
        const jobList = Array.isArray(data?.result?.jobs)
          ? data.result.jobs
          : Array.isArray(data?.jobs)
            ? data.jobs
            : Array.isArray(data)
              ? data
              : []
        setJobs(jobList)
      } catch {
        setError('Failed to load jobs. Please try again.')
      } finally {
        setLoading(false)
      }
    }
    fetchJobs()
  }, [])

  const recommendedJobs = user && Array.isArray(jobs)
    ? [...jobs]
      .map(job => ({ job, score: getMatchScore(job, user) }))
      .filter(({ score }) => score > 0)
      .sort((a, b) => b.score - a.score)
      .slice(0, 9)
      .map(({ job }) => job)
    : Array.isArray(jobs) ? jobs.slice(0, 9) : []

  return (
    <div className="max-w-5xl mx-auto px-4 py-8 mt-12">
      {/* Header */}


      {/* Loading */}
      {loading && (
        <div className="min-h-screen bg-white flex items-center justify-center">
          <div className="text-center">
            <div className="w-20 h-20 border-4 border-black border-t-transparent rounded-full animate-spin mx-auto mb-6"></div>
            <p className="text-black font-semibold text-lg">Loading...</p>
          </div>
        </div>
      )}

      {/* Error */}
      {!loading && error && (
        <div className="text-center py-12 px-6 bg-red-50 dark:bg-red-900/10 border border-red-200 dark:border-red-800 rounded-2xl">
          <p className="text-2xl mb-2">⚠️</p>
          <p className="text-sm font-semibold text-red-600 dark:text-red-400">{error}</p>
        </div>
      )}

      {/* Empty */}
      {!loading && !error && recommendedJobs.length === 0 && (
        <div className="text-center py-16 text-zinc-400">
          <p className="text-4xl mb-3">🔍</p>
          <p className="font-semibold text-base text-zinc-600 dark:text-zinc-300">No matches found</p>
          <p className="text-sm mt-1">Update your skills to get better recommendations</p>
        </div>
      )}

      {/* Job Grid */}
      {!loading && !error && recommendedJobs.length > 0 && (
        <>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {recommendedJobs.map((job, i) => (
              <JobCard key={job._id} job={job} user={user} rank={i} />
            ))}
          </div>
          <p className="text-center text-xs text-zinc-400 mt-8">
            {recommendedJobs.length} job{recommendedJobs.length !== 1 ? 's' : ''} matched to your skill profile
          </p>
        </>
      )}
    </div>
  )
}